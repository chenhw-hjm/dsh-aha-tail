/**
 * 素材目录扫描与路径防护（Host 半，纯函数 + fs，便于单独测试）。
 *
 * 默认素材是插件自带的 `assets/`，也可以通过 `dir` 换成用户自己的图片文件夹
 * （可能含中文、空格、多层子目录）。浏览器读不了本地磁盘，所以清单和字节
 * 都由 Host 路由提供。
 * @module aha-tail/scan
 */
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

/** 认的扩展名 → Content-Type。 */
const IMAGE_TYPES = new Map([
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.webp', 'image/webp'],
  ['.avif', 'image/avif'],
])

/** @param {string} file @returns {string} */
export function contentTypeOf(file) {
  return IMAGE_TYPES.get(path.extname(file).toLowerCase()) ?? 'application/octet-stream'
}

/** @param {string} file @returns {boolean} */
export function isImageFile(file) {
  return IMAGE_TYPES.has(path.extname(file).toLowerCase())
}

/**
 * 递归列出目录里的图片，返回相对路径（统一用 `/` 分隔、按路径排序）。
 *
 * 只认文件；目录不可读时整支返回空数组而不是抛错——素材目录被删掉时
 * 插件应当安静地不显示，而不是把每轮渲染都打成错误。
 *
 * @param {string} root 素材根目录
 * @param {{ recursive?: boolean, include?: string[] | null, exclude?: string[] | null }} [opts]
 *   include / exclude 是对相对路径（`/` 分隔）做子串匹配的过滤表；空/缺省不生效。
 * @returns {Promise<string[]>}
 */
export async function scanImages(root, opts = {}) {
  const recursive = opts.recursive !== false
  const include = normalizeList(opts.include)
  const exclude = normalizeList(opts.exclude)
  /** @type {string[]} */
  const out = []

  async function walk(abs, rel) {
    let entries
    try {
      entries = await readdir(abs, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const nextRel = rel ? rel + '/' + entry.name : entry.name
      const nextAbs = path.join(abs, entry.name)
      if (entry.isDirectory()) {
        if (recursive) await walk(nextAbs, nextRel)
        continue
      }
      if (!entry.isFile()) continue
      if (!isImageFile(entry.name)) continue
      if (include && !include.some((part) => nextRel.includes(part))) continue
      if (exclude && exclude.some((part) => nextRel.includes(part))) continue
      out.push(nextRel)
    }
  }

  const info = await stat(root).catch(() => null)
  if (!info || !info.isDirectory()) return []
  await walk(root, '')
  out.sort()
  return out
}

/**
 * 把清单里的相对路径解析成根目录内的绝对路径；越界返回 null。
 * @param {string} root
 * @param {string} rel
 * @returns {string | null}
 */
export function resolveInside(root, rel) {
  if (typeof rel !== 'string' || rel.length === 0) return null
  if (rel.includes('\0')) return null
  const rootAbs = path.resolve(root)
  const full = path.resolve(rootAbs, rel.split('/').join(path.sep))
  if (full === rootAbs) return null
  const prefix = rootAbs.endsWith(path.sep) ? rootAbs : rootAbs + path.sep
  return full.startsWith(prefix) ? full : null
}

/** @param {unknown} value @returns {string[] | null} */
function normalizeList(value) {
  if (!Array.isArray(value)) return null
  const list = value.filter((item) => typeof item === 'string' && item.trim().length > 0)
  return list.length > 0 ? list : null
}
