# 发布与更新手册（dsh-aha-tail）

> **当前状态**：本仓库已经发布在 <https://github.com/chenhw-hjm/dsh-aha-tail>，
> 带 tag `v0.2.0` 和 [Release](https://github.com/chenhw-hjm/dsh-aha-tail/releases/tag/v0.2.0)。
> 本文既写「以后改版怎么推」，也写「换个人/换个项目怎么从头发」。

## 一、本机已完成的一次性配置

| 项 | 状态 | 怎么查 |
| --- | --- | --- |
| git 仓库身份 | `chenhw-hjm` / `278875396+chenhw-hjm@users.noreply.github.com`（仓库级，没动全局） | `git config user.name` |
| GitHub 凭据 | `gh auth status` → `✓ Logged in to github.com account chenhw-hjm (keyring)` | `gh auth status` |
| git 推送认证 | `gh auth setup-git` 已把 gh 设为 credential helper | `git config --get credential.https://github.com.helper` |
| 远端 | `origin` = `https://github.com/chenhw-hjm/dsh-aha-tail.git` | `git remote -v` |

`gh` 不在 PATH 里时用全路径：`C:\Users\chenhw\.dsh\tools\gh\gh.exe`。
token 存在系统钥匙串（keyring），**之后 push 不用再登录**。

## 二、改完东西怎么发（日常三步）

```powershell
cd C:\Users\chenhw\Documents\deepseek-harness\default-workspace\dsh-aha-tail
git status --short          # 看看改了啥
git add -A
git commit -m "fix: 说明这次改了什么"
git push
```

发版（可选，方便别人下 zip；也方便自己回滚）：

```powershell
git tag -a v0.2.1 -m "v0.2.1 - 一句话说明"
git push origin v0.2.1
gh release create v0.2.1 --title "v0.2.1 - 标题" --notes "更新内容"
```

改已有 Release 的说明：`gh release edit v0.2.1 --notes-file notes.md`。

## 三、从零把**一个新项目**发到 GitHub（通用步骤）

### 1. 本地先成一个仓库

```powershell
cd <项目目录>
git init
git checkout -b main          # git ≥2.28 可以写 git init -b main
git add -A
git commit -m "feat: 初始版本"
```

先看一眼别把垃圾提上去：`git status --short`，`.gitignore` 里放好 `node_modules/`、`dist/`、日志、`__pycache__/`。

### 2. 建远端仓库

- **有 gh**（本机已装）：

  ```powershell
  gh repo create <你的用户名>/<仓库名> --public --source=. --remote=origin --push `
    --description "一句话介绍"
  ```

  `--source=.` 表示用当前目录、`--push` 建完直接推上去、`--remote=origin` 顺手配好远端。

- **没 gh**：网页 github.com 右上角 `+` → New repository → 填名字、**不要**勾选初始化 README（否则会有一次提交，push 时要先 pull）；建好后：

  ```powershell
  git remote add origin https://github.com/<用户名>/<仓库名>.git
  git push -u origin main
  ```

### 3. 认证（三选一）

| 方式 | 做法 | 适合 |
| --- | --- | --- |
| GitHub CLI | `gh auth login`（本机用设备码：网页输入 8 位码点授权） | 最省事，本机已完成 |
| PAT | 网页 Settings → Developer settings → Personal access tokens，勾 `repo`，push 时用户名填账号、密码粘贴 token | 不用装工具 |
| SSH | `ssh-keygen -t ed25519`，把 `~/.ssh/id_ed25519.pub` 贴到 Settings → SSH keys | 长期用多台机器 |

⚠️ 用账号密码 push 早就不被支持了（`Support for password authentication was removed`），必须用上面三种之一。

### 4. 建完顺手做的三件事

- 仓库 Settings → 填 **Description**；About 右侧的齿轮里加 **Topics**（`dsh-plugin`、`sticker` 之类，别人好搜到）
- 加 **LICENSE**（MIT 最省事）
- README 顶部写清：一句话是什么、截图/GIF 演示、安装步骤、配置项

## 四、把插件发到 npm（可选，这次没做）

从 GitHub 装需要 `git clone`，发 npm 后别人可以 `npm i` / 用 dsh-market 一键装。步骤：

1. 把 `package.json` 的 `name` 改成你自己的 scope，例如 `@chenhw-hjm/dsh-aha-tail`（npm 不接受 `dsh-aha-tail` 这种可能重名的裸名，先查 <https://www.npmjs.com> 有没有被占）
2. 删掉 `"private": true`（如果有），确认 `"files"` 里包含 `assets/`
3. `npm login` → `npm publish --access public`
4. 之后每次发版前手动改 `version`，再 `npm publish`

## 五、踩过的坑（本仓库真实经历）

1. **PowerShell 默认编码会毁中文**：`Get-Content`（无 `-Encoding`）在中文 Windows 上按 GBK 解码 UTF-8 文件，
   再 `Set-Content -Encoding utf8` 写回，就变成「路 闃垮搱」这种乱码（本仓库 v0.2.0 的 README 中过招）。
   正确写法：

   ```powershell
   $t = [System.IO.File]::ReadAllText($p)            # 默认 UTF-8
   [System.IO.File]::WriteAllText($p, $t, (New-Object System.Text.UTF8Encoding($false)))
   ```

   或者干脆用编辑器 / Agent 的文件工具写中文。

2. **BOM 毁 JSON**：带 BOM 的 `package.json` 会让 `JSON.parse` 报 `Unexpected token '﻿'`。
   写 JSON 一律用 **UTF-8 无 BOM**。

3. **git 2.13 不支持 `git init -b main`**：先 `git init`，再 `git checkout -b main`。

4. **Windows PowerShell 把双引号吃掉**：`gh api ... --jq '.a + " " + .b'` 会报 `accepts 1 arg(s), received 2`；
   要么把 jq 表达式写成单引号内不含双引号，要么用 `ConvertFrom-Json` 在 PowerShell 里处理。

5. **仓库体积**：GitHub 对**单个文件**硬限 100 MB，仓库建议 1 GB 以内。本项目原素材 1025 个文件 / 1.3 GB，
   只保留「已抠图」那套并转 WebP 后是 **517 个文件 / 9.3 MB**。大二进制真需要版本管理时用 Git LFS（`git lfs track "*.psd"`）。

6. **本地目录安装是链接引用**：`plugin_manager install_bundle` 装的是目录路径，装完把源目录删掉/挪走，插件就失效。
   要「分发」，让别人 clone 到固定目录再装，而不是把目录塞进插件市场。

## 六、本仓库的发布记录

| 时间 | 动作 |
| --- | --- |
| 2026-11-18 | 提交 `70f4dac`：`feat: Aha sticker tail plugin v0.2.0 (517 bundled stickers, zero config)` |
| 2026-11-18 | 提交 `f927511`：`chore: strip UTF-8 BOM from text files (strict JSON.parse compatibility)` |
| 2026-11-18 | `gh repo create` 建 public 仓库并 push，main 跟踪 origin/main |
| 2026-11-18 | 打 tag `v0.2.0` + 建 Release |
| — | 修复 README / PUBLISH 中文乱码（重写为 UTF-8） |
| 2026-11-18 | 提交 `7643e67`：`fix: rewrite README and PUBLISH in clean UTF-8 (fix garbled text in plugin details)`；版本 → 0.2.1 |
