/**
 * Aha 表情包（Host 半）：把插件自带的表情包，或用户自己的图片文件夹，
 * 通过 webServer 路由喂给 Web 界面。
 *
 * 浏览器读不了本地磁盘，所以这里做两件事：
 *   1. `GET /aha-tail/api/index.json` → 清单（图像相对路径、显示高度）与开关；
 *   2. `GET /aha-tail/f/<urlencoded 相对路径>` → 图片字节（带 ETag / 304 / 长缓存）。
 *
 * 渲染在 Client 半（client.js）的 `conversation.chat.turnTail`。
 * 素材目录只读，本插件不写任何文件。
 * @module aha-tail/host
 */
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { contentTypeOf, resolveInside, scanImages } from './scan.js'

/** 路由前缀（与 client.js 里的常量保持一致）。 */
export const ROUTE = '/aha-tail'

/** 插件自带的素材目录：装好即用，不需要任何配置。 */
const BUNDLED_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'assets')

/** 清单缓存时长：目录内容变动最多 1 分钟后可见，避免每轮都重扫几百个文件。 */
const CACHE_MS = 60_000

/** 缺省显示高度（px）与允许范围。 */
const DEFAULT_HEIGHT = 84
const MIN_HEIGHT = 32
const MAX_HEIGHT = 240

export const name = 'aha-tail'

/** webServer 由 Host 提供；没有它的环境里插件不激活（它是 Web 界面专用）。 */
export const inject = ['webServer']

/**
 * @param {any} ctx Cordis 上下文
 * @param {any} [rawConfig] cordis.patch.yml 里这一行的 config
 */
export function apply(ctx, rawConfig) {
  const cfg = rawConfig !== null && typeof rawConfig === 'object' ? rawConfig : {}
  const custom = typeof cfg.dir === 'string' && cfg.dir.trim().length > 0 ? cfg.dir.trim() : ''
  const dir = custom || process.env.DSH_AHA_TAIL_DIR || BUNDLED_DIR
  const enabled = cfg.enabled !== false
  const height = clampInt(cfg.height, DEFAULT_HEIGHT, MIN_HEIGHT, MAX_HEIGHT)
  const include = Array.isArray(cfg.include) ? cfg.include : null
  const exclude = Array.isArray(cfg.exclude) ? cfg.exclude : null
  const log = ctx.logger ?? console

  /** @type {{ files: string[], at: number } | null} */
  let cache = null

  async function files() {
    const now = Date.now()
    if (cache !== null && now - cache.at < CACHE_MS) return cache.files
    const scanned = await scanImages(dir, { recursive: cfg.recursive !== false, include, exclude })
    cache = { files: scanned, at: now }
    return scanned
  }

  /** @param {any} req @param {any} res */
  async function handle(req, res) {
    try {
      const url = new URL(String(req?.url ?? '/'), 'http://localhost')
      const pathname = url.pathname

      if (pathname === ROUTE + '/api/index.json') {
        const list = enabled ? await files() : []
        return sendJson(res, 200, {
          enabled,
          height,
          count: list.length,
          source: custom ? 'custom' : 'bundled',
          files: list,
        })
      }

      const prefix = ROUTE + '/f/'
      if (!pathname.startsWith(prefix)) return sendJson(res, 404, { error: 'not found' })

      let rel
      try {
        rel = decodeURIComponent(pathname.slice(prefix.length))
      } catch {
        return sendJson(res, 400, { error: 'bad path' })
      }
      if (rel.length === 0) return sendJson(res, 400, { error: 'missing image path' })
      const full = resolveInside(dir, rel)
      if (full === null) return sendJson(res, 403, { error: 'outside assets dir' })

      const info = await stat(full).catch(() => null)
      if (info === null || !info.isFile()) return sendJson(res, 404, { error: 'no such image' })

      const etag = '"' + info.size.toString(16) + '-' + Math.floor(info.mtimeMs).toString(16) + '"'
      const ifNoneMatch = req?.headers?.['if-none-match']
      if (typeof ifNoneMatch === 'string' && ifNoneMatch.includes(etag)) {
        res.writeHead(304, { ETag: etag, 'Cache-Control': 'public, max-age=86400' })
        return res.end()
      }

      const bytes = await readFile(full)
      res.writeHead(200, {
        'Content-Type': contentTypeOf(full),
        'Content-Length': bytes.length,
        ETag: etag,
        'Cache-Control': 'public, max-age=86400, immutable',
      })
      return res.end(bytes)
    } catch (error) {
      log.warn?.('[aha-tail] 素材路由出错：' + String(error instanceof Error ? error.message : error))
      try {
        return sendJson(res, 500, { error: 'internal error' })
      } catch {
        return undefined
      }
    }
  }

  ctx.effect(
    () => ctx.webServer.register({ kind: 'prefix', path: ROUTE, handler: handle }),
    'aha-tail: assets route',
  )
  log.info?.('[aha-tail] 表情包路由已挂载：' + dir)
}

/** @param {any} res @param {number} status @param {unknown} body */
function sendJson(res, status, body) {
  const text = JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(text),
  })
  res.end(text)
}

/** @param {unknown} value @param {number} fallback @param {number} min @param {number} max */
function clampInt(value, fallback, min, max) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.round(n)))
}
