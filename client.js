/**
 * Aha 表情包（Client 半）：在每轮对话结束时贴一张表情包。
 *
 * 注册到 `conversation.chat.turnTail`（每个已完成的回合都会渲染一次）。
 * 选图是「确定性的随机」：以这一轮的身份做哈希，滚动离开再回来不会换图；
 * 点一下（或聚焦后按回车/空格）换下一张。清单来自 Host 半的
 * `/aha-tail/api/index.json`，默认就是插件自带的素材。
 * @module aha-tail/client
 */
window.__ModuleLoader__.load({
  id: 'dsh-aha-tail',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    /** 与 Host 半的 ROUTE 保持一致。 */
    const ROUTE = '/aha-tail'
    const DEFAULT_HEIGHT = 84

    /** 清单只取一次（同一页面生命周期内）；失败的下次挂载重试。 */
    let pending = null
    function loadManifest() {
      if (pending === null) {
        pending = fetch(ROUTE + '/api/index.json', { cache: 'no-store' })
          .then((response) => (response.ok ? response.json() : null))
          .catch(() => null)
          .then((data) => {
            const ok =
              data !== null &&
              data.enabled === true &&
              Array.isArray(data.files) &&
              data.files.length > 0
            if (!ok) pending = null
            return data
          })
      }
      return pending
    }

    /** 选图用的稳定种子：优先这一轮的身份，其次 tail 序号。 */
    function seedOf(props) {
      const turn = props && props.turn
      if (turn !== null && typeof turn === 'object') {
        const id = turn.id ?? turn.key ?? turn.turnId ?? turn.index
        if (id !== undefined && id !== null) return 'turn:' + String(id)
        try {
          return 'turn:' + JSON.stringify(turn)
        } catch {
          /* 下面退回序号 */
        }
      }
      if (props && typeof props.seq === 'number') return 'seq:' + props.seq
      return null
    }

    function hashString(text) {
      let hash = 2166136261
      for (let i = 0; i < text.length; i += 1) {
        hash ^= text.charCodeAt(i)
        hash = Math.imul(hash, 16777619)
      }
      return hash >>> 0
    }

    /** `game/1-疑惑.webp` → `疑惑`；拿不到情绪词时退回文件名。 */
    function moodOf(rel) {
      const base = rel.slice(rel.lastIndexOf('/') + 1).replace(/\.[^.]+$/, '')
      const parts = base.split('-')
      if (parts.length > 1 && /^\d+$/.test(parts[0])) return parts.slice(1).join('-')
      return base
    }

    const ROW_STYLE = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '2px 0 6px',
      lineHeight: 0,
    }

    function imageStyle(height) {
      return {
        height: height,
        width: 'auto',
        maxWidth: Math.round(height * 2.6),
        objectFit: 'contain',
        borderRadius: 10,
        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.18))',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'transform 120ms ease',
      }
    }

    function AhaTail(props) {
      const [manifest, setManifest] = React.useState(null)
      const [offset, setOffset] = React.useState(0)
      const [fallbackSeed] = React.useState(() => 'rand:' + Math.floor(Math.random() * 1e9))

      React.useEffect(() => {
        let alive = true
        loadManifest().then((data) => {
          if (alive) setManifest(data)
        })
        return () => {
          alive = false
        }
      }, [])

      if (
        manifest === null ||
        manifest.enabled !== true ||
        !Array.isArray(manifest.files) ||
        manifest.files.length === 0
      ) {
        return null
      }

      const total = manifest.files.length
      const seed = seedOf(props) ?? fallbackSeed
      const base = hashString(seed) % total
      const index = (base + offset) % total
      const file = manifest.files[index]
      const height = typeof manifest.height === 'number' ? manifest.height : DEFAULT_HEIGHT
      const mood = moodOf(file)

      const swap = (event) => {
        event.preventDefault()
        event.stopPropagation()
        setOffset((value) => value + 1)
      }

      return h(
        'div',
        { style: ROW_STYLE },
        h('img', {
          src: ROUTE + '/f/' + encodeURIComponent(file),
          alt: mood,
          title: mood,
          'data-aha-sticker': '',
          loading: 'lazy',
          decoding: 'async',
          draggable: false,
          tabIndex: 0,
          role: 'button',
          style: imageStyle(height),
          onClick: swap,
          onKeyDown(event) {
            if (event.key === 'Enter' || event.key === ' ') swap(event)
          },
        }),
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('conversation.chat.turnTail', () =>
          ctx.slots.register(
            { name: 'conversation.chat.turnTail', id: 'aha-tail', order: 30 },
            AhaTail,
          ),
        )
      },
    }
  },
})
