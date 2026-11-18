/**
 * Host 半的离线测试：素材扫描的边界情况 + 路由的真实响应。
 * 跑法（不需要安装到 DSH）：`node test/host.test.mjs`
 */
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

import { apply, inject, name, ROUTE } from '../index.js'
import { contentTypeOf, isImageFile, resolveInside, scanImages } from '../scan.js'

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const ASSETS = path.join(ROOT, 'assets')

/** 假的 res：收集 status / headers / body。 */
function fakeRes() {
  const out = { status: 0, headers: {}, body: null }
  return {
    out,
    writeHead(status, headers) {
      out.status = status
      out.headers = headers ?? {}
    },
    end(body) {
      out.body = body ?? null
    },
  }
}

/** 起一个插件实例，拦下注册出来的路由处理函数。 */
function mount(config) {
  let handler = null
  let disposed = false
  const ctx = {
    logger: { info() {}, warn() {} },
    effect(fn) {
      const cleanup = fn()
      return () => {
        disposed = true
        if (typeof cleanup === 'function') cleanup()
      }
    },
    webServer: {
      register(route) {
        assert.equal(route.kind, 'prefix')
        assert.equal(route.path, ROUTE)
        handler = route.handler
        return () => {}
      },
    },
  }
  apply(ctx, config)
  assert.notEqual(handler, null, 'apply 应当注册一条前缀路由')
  return {
    get disposed() {
      return disposed
    },
    async request(pathname, headers = {}) {
      const res = fakeRes()
      await handler({ url: pathname, headers }, res)
      return res.out
    },
  }
}

test('导出与常量', () => {
  assert.equal(name, 'aha-tail')
  assert.deepEqual(inject, ['webServer'])
  assert.equal(ROUTE, '/aha-tail')
})

test('内容类型与图片判定', () => {
  assert.equal(contentTypeOf('a/b.PNG'), 'image/png')
  assert.equal(contentTypeOf('a.webp'), 'image/webp')
  assert.equal(contentTypeOf('a.gif'), 'image/gif')
  assert.equal(contentTypeOf('a.txt'), 'application/octet-stream')
  assert.equal(isImageFile('x/1-疑惑.webp'), true)
  assert.equal(isImageFile('x/readme.md'), false)
})

test('自带素材可被扫描，且只含图片', async () => {
  const files = await scanImages(ASSETS)
  assert.ok(files.length > 0, 'assets/ 里应当有素材，先跑 scripts/build-assets.py')
  assert.ok(files.every((file) => /\.(webp|gif|png|jpe?g|avif)$/i.test(file)))
  assert.ok(files.every((file) => !file.includes('\\')), '相对路径统一用 / 分隔')
  assert.deepEqual(files, [...files].sort(), '清单应当有序')
})

test('递归 / 非递归 / include / exclude', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'aha-scan-'))
  try {
    await mkdir(path.join(dir, 'game'), { recursive: true })
    await mkdir(path.join(dir, 'pv'), { recursive: true })
    await writeFile(path.join(dir, 'game', '1-疑惑.png'), 'x')
    await writeFile(path.join(dir, 'game', '2.webp'), 'x')
    await writeFile(path.join(dir, 'pv', '3.gif'), 'x')
    await writeFile(path.join(dir, 'notes.txt'), 'x')

    const deep = await scanImages(dir)
    assert.deepEqual(deep, ['game/1-疑惑.png', 'game/2.webp', 'pv/3.gif'])

    const shallow = await scanImages(dir, { recursive: false })
    assert.deepEqual(shallow, [])

    const onlyGame = await scanImages(dir, { include: ['game/'] })
    assert.deepEqual(onlyGame, ['game/1-疑惑.png', 'game/2.webp'])

    const noGif = await scanImages(dir, { exclude: ['gif'] })
    assert.deepEqual(noGif, ['game/1-疑惑.png', 'game/2.webp'])

    assert.deepEqual(await scanImages(path.join(dir, 'nope')), [])
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('路径防护挡住目录穿越', () => {
  assert.equal(resolveInside(ASSETS, '../../secret.txt'), null)
  assert.equal(resolveInside(ASSETS, '..\\..\\secret.txt'), null)
  assert.equal(resolveInside(ASSETS, ''), null)
  assert.equal(resolveInside(ASSETS, 'game/../../x.png'), null)
  assert.notEqual(resolveInside(ASSETS, 'game/1.webp'), null)
})

test('清单路由：内置素材', async () => {
  const app = mount()
  const out = await app.request(ROUTE + '/api/index.json')
  assert.equal(out.status, 200)
  const data = JSON.parse(out.body.toString('utf8'))
  assert.equal(data.enabled, true)
  assert.equal(data.source, 'bundled')
  assert.equal(data.height, 84)
  assert.ok(data.count > 0)
  assert.equal(data.count, data.files.length)
  assert.match(out.headers['Content-Type'], /application\/json/)
})

test('图片路由：200 / Content-Type / ETag / 304', async () => {
  const app = mount()
  const list = JSON.parse((await app.request(ROUTE + '/api/index.json')).body.toString('utf8'))
  const rel = list.files[0]

  const first = await app.request(ROUTE + '/f/' + encodeURIComponent(rel))
  assert.equal(first.status, 200)
  assert.ok(first.body.length > 0)
  assert.match(first.headers['Content-Type'], /^image\//)
  assert.ok(first.headers.ETag)

  const again = await app.request(ROUTE + '/f/' + encodeURIComponent(rel), {
    'if-none-match': first.headers.ETag,
  })
  assert.equal(again.status, 304)
})

test('越界 / 非法 / 缺失', async () => {
  const app = mount()
  assert.equal((await app.request(ROUTE + '/f/..%2F..%2FWindows%2Fwin.ini')).status, 403)
  assert.equal((await app.request(ROUTE + '/f/')).status, 400)
  assert.equal((await app.request(ROUTE + '/f/' + encodeURIComponent('game/nope.png'))).status, 404)
  assert.equal((await app.request(ROUTE + '/api/other.json')).status, 404)
})

test('关闭后清单为空', async () => {
  const app = mount({ enabled: false })
  const data = JSON.parse((await app.request(ROUTE + '/api/index.json')).body.toString('utf8'))
  assert.equal(data.enabled, false)
  assert.deepEqual(data.files, [])
})

test('自定义目录优先于内置素材', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'aha-custom-'))
  try {
    await writeFile(path.join(dir, '1-开心.png'), 'x')
    const app = mount({ dir })
    const data = JSON.parse((await app.request(ROUTE + '/api/index.json')).body.toString('utf8'))
    assert.equal(data.source, 'custom')
    assert.equal(data.count, 1)
    assert.deepEqual(data.files, ['1-开心.png'])
    assert.equal((await app.request(ROUTE + '/f/' + encodeURIComponent('1-开心.png'))).status, 200)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('目录不存在时安静返回空清单', async () => {
  const app = mount({ dir: path.join(os.tmpdir(), 'aha-does-not-exist-xyz') })
  const data = JSON.parse((await app.request(ROUTE + '/api/index.json')).body.toString('utf8'))
  assert.equal(data.count, 0)
  assert.deepEqual(data.files, [])
})

test('height 越界被夹到合法区间', async () => {
  const low = mount({ height: 1 })
  const high = mount({ height: 9999 })
  assert.equal(JSON.parse((await low.request(ROUTE + '/api/index.json')).body.toString('utf8')).height, 32)
  assert.equal(JSON.parse((await high.request(ROUTE + '/api/index.json')).body.toString('utf8')).height, 240)
})
