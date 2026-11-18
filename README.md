# dsh-aha-tail · Aha 表情包

> 每轮对话结束，在回复末尾（动作行之前）贴一张「阿哈」表情包；点一下换下一张。

[DeepSeek Harness](https://github.com/deepseek-ai) Web 界面插件。插件**自带 517 张表情包**（508 张静态 + 9 张动图），装好刷新页面就能用，不需要任何配置；也可以把 `dir` 指向你自己的图片文件夹。

> **素材来源**：内置表情包来自哔哩哔哩 UP 主 **「最上川下山」** 分享的「阿哈」表情包，版权归原作者所有，本仓库仅作个人自用收录。详见文末[《素材来源与版权声明》](#素材来源与版权声明)。

- 当前版本：`v0.2.2` · 代码许可：MIT · 生效位置：`conversation.chat.turnTail` 插槽
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

`count` 为 0 或 404 说明插件没启用，或者端口不对。插件列表里应看到「Aha 表情包 v0.2.2」，组件状态「运行中」。

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

## 素材来源与版权声明

- **素材来源**：本插件内置的 517 张「阿哈」表情包，原始素材来自哔哩哔哩 UP 主 **「最上川下山」** 分享的阿哈表情包，由本仓库作者收集后转码（PNG / GIF → WebP）打包，未对画面内容做二次创作。
- **版权归属**：表情包原图（角色形象、画面、动图）的版权归**原作者及原权利方**所有。本仓库对这部分素材**不主张任何权利**，也**未获得任何商业授权**，MIT 许可只覆盖本仓库的代码（`index.js` / `client.js` / `scan.js` / 测试脚本等），不覆盖 `assets/` 下的图片。
- **使用范围**：收录这些素材只为**个人学习与自用**（在自己本机的 DSH 界面里看个乐子）。仓库公开只是为了方便自己换机器、或朋友想装的时候能拿到。
- **请勿**：把 `assets/` 用于商业用途、对外再分发、批量搬运或冒充原创；需要转载 / 商用请先联系原作者取得授权，并保留对来源（B站 UP 主「最上川下山」）的署名。
- **权利方请求**：如果你是作者本人或权利方，认为这里的收录不合适，请开 Issue 说明，我会在确认后**立即删除 `assets/` 目录**，并把默认素材改为「用户自备目录」模式（插件本来就支持 `dir` 配置，删掉自带素材不影响代码可用）。

## 许可

- **代码**：MIT，见 [LICENSE](./LICENSE)。
- **素材**：版权归原作者（哔哩哔哩 UP 主「最上川下山」及原权利方），不在 MIT 许可范围内，仅限个人非商业使用。
