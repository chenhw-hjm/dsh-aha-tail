# dsh-aha-tail · Aha 表情包

> 每轮对话结束，在回复末尾（动作行之前）贴一张「阿哈」表情包；点一下换下一张。

[DeepSeek Harness](https://github.com/deepseek-ai) Web 界面插件。插件**自带 517 张表情包**（508 张静态 + 9 张动图），装好刷新页面就能用，不需要任何配置；也可以把 `dir` 指向你自己的图片文件夹。

- 当前版本：`v0.2.1` · 许可：MIT · 生效位置：`conversation.chat.turnTail` 插槽
- 只影响 Web 界面，不经过模型、不花 token、不写任何文件（素材目录只读）

## 特性

- **零配置**：素材打在包里（`assets/`，9.3 MB），装完即用
- **确定性选图**：同一轮回复始终贴同一张，滚动离开再回来不会变；点一下才换下一张（Tab 聚焦后回车 / 空格也行）
- **可换素材**：`dir` 填一个文件夹即可，支持多级子目录，认 `png / jpg / jpeg / gif / webp / avif`
- **省流量**：图片走 Host 路由，带 `ETag` / 304 / 一天长缓存，`loading="lazy"`，不重复下载
- **轻**：一个 Host 路由 + 一个 React 组件；不改系统提示词、不调模型、不产生 token

## 安装

### 前置

- 已安装 DeepSeek Harness（桌面版自带 Web 界面；Node ≥ 20）
- 有 Git（或者直接下 zip 解压，效果一样）

### 方式 1 · 克隆后让 Agent 安装（推荐）

```powershell
git clone https://github.com/chenhw-hjm/dsh-aha-tail.git C:\dsh-plugins\dsh-aha-tail
```

然后在这个 DSH 会话里说：

```
用 plugin_manager 把 C:\dsh-plugins\dsh-aha-tail 装成插件
```

（等价操作：插件管理面板 → 安装本地目录 → 选这个文件夹。`target` 必须是**包目录的绝对路径**，不是 zip。）

装完 **刷新页面**（`Ctrl+R`）。之后每轮回复末尾就会多出一张表情包。

> 本地目录安装是「链接引用」：装完**不能删除或移动**那个目录，否则插件失效。

### 方式 2 · 下载 zip

在 [Releases](https://github.com/chenhw-hjm/dsh-aha-tail/releases) 下载源码 zip，解压到一个固定目录，再按上面方式用 `plugin_manager install_bundle` 装那个目录。

### 验证装上了

浏览器打开 `http://127.0.0.1:<你的端口>/aha-tail/api/index.json`，应当返回这样的 JSON：

```json
{"enabled":true,"height":84,"count":517,"source":"bundled","files":["game/1-疑惑.webp", "..."]}
```

`count` 为 0 或 404 说明插件没启用，或者端口不对。插件列表里应看到「Aha 表情包 v0.2.0」，组件状态「运行中」。

## 配置

配置写在 `cordis.patch.yml` 里 `aha-tail` 那一行的 `config`（改完重载插件生效）：

| 键 | 默认 | 说明 |
| --- | --- | --- |
| `dir` | `''` | 素材目录。`''` = 用插件自带的 `assets/`；填绝对路径 = 用你自己的文件夹 |
| `enabled` | `true` | 总开关 |
| `height` | `84` | 显示高度，单位 px，范围 32–240 |
| `include` | `[]` | 只保留相对路径里含这些片段的图片，例如 `['game/']` 只用游戏那套 |
| `exclude` | `[]` | 排除含这些片段的图片，例如 `['gif/']` 不要动图 |
| `recursive` | `true` | 是否递归扫子目录 |

也支持环境变量 `DSH_AHA_TAIL_DIR`（优先级低于 `dir`）。

例：换成自己的目录、只要游戏那套、贴大一点：

```yaml
config:
  dir: 'D:\my-stickers'
  height: 96
  include: ['game/']
```

### 换成自己的表情包

1. 准备一个文件夹（`png / jpg / jpeg / gif / webp / avif`，可多级子目录）
2. 把 `dir` 指过去，重载插件
3. 清单里的 `source` 会变成 `custom`，`count` 是你自己的数量

目录内容变动最多 1 分钟后生效（清单缓存 60 秒，避免每轮重扫几百个文件）。

## 工作原理

- **Host（`index.js`）**：用 `ctx.webServer.register({ kind: 'prefix', path: '/aha-tail', handler })` 提供两个路由
  - `GET /aha-tail/api/index.json` → `{ enabled, height, count, source, files[] }`
  - `GET /aha-tail/f/<encodeURIComponent(相对路径)>` → 图片字节；Content-Type 按扩展名，`ETag` 由 size+mtime 生成，命中 `If-None-Match` 返回 304
  - 防目录穿越：`resolveInside()` 只允许素材目录内的路径（越界 403）；空路径 400、缺文件 404
- **Client（`client.js`）**：注册 `conversation.chat.turnTail`（id `aha-tail`，order 30），按 `{turn, seq}` 的稳定标识算 FNV-1a 下标选图；清单只取一次，失败或空池时返回 `null`（不炸插槽）
- **素材转码（`scripts/build-assets.py`）**：Pillow 把原图转 WebP（长边 ≤256、静态 q82、动图 q75），568 MB → 9.3 MB

## 目录结构

```
dsh-aha-tail/
├── index.js              # Host：素材路由 + 清单
├── client.js             # Client：turnTail 组件
├── scan.js               # 扫描/路径校验/Content-Type
├── cordis.patch.yml      # 插件装载与配置
├── package.json          # 包描述（dsh.bundle / dsh.client）
├── locale/               # 插件列表里的中文/英文文案
├── icon.svg              # 插件图标
├── assets/               # 自带素材：pv/ game/ gif/ + catalog.json
├── scripts/build-assets.py
└── test/host.test.mjs    # 12 项 Host 侧测试
```

跑测试：`node test/host.test.mjs`

## 常见问题

| 现象 | 排查 |
| --- | --- |
| 回复末尾没有图 | 插件列表里是否启用；刷新页面；打开 `index.json` 看 `count` |
| `index.json` 404 | 插件没启用，或端口不是 DSH 的那个（看地址栏） |
| 图片 404 | `dir` 路径写错；或路径里有中文，确认用的是绝对路径 |
| 每轮贴两张 | 以前装过 `meme-tail` 的话，把它停用 |
| 想临时关掉 | `enabled: false`，或在插件列表里关开关 |

## 许可

代码 MIT。表情包素材版权归原作者（「阿哈」表情包整理自网络公开素材），本仓库仅为个人使用打包；商用或二次分发请自行确认授权。
