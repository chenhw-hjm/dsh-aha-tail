# 鎶?dsh-aha-tail 鍙戝竷鍒?GitHub锛堟墜鎶婃墜锛?
> 鍦?Windows 涓婁粠銆屾湰鍦版湁鍑犱釜鏂囦欢銆嶅仛鍒般€孏itHub 涓婃湁涓兘缁欏埆浜?clone 鐨勫叕寮€浠撳簱銆嶃€?> 鍏ㄧ▼鍙湪 PowerShell 閲屾暡鍛戒护 + 鐐瑰嚑涓嬬綉椤点€?
## 鈿?浣犺繖鍙版満鍣ㄧ殑涓や釜鍓嶆彁锛堝厛鐪嬭繖涓級

1. **Git 鐗堟湰澶棫**锛氬綋鍓嶆槸 `git version 2.13.0.windows.1`锛?017 骞达級銆?   - 瀹?*涓嶆敮鎸?* `git init -b main`锛?.28 鎵嶆湁锛夆€斺€斾笅闈㈠凡缁忕粰浜嗘棫鐗堝啓娉曪紝鎴栬€呯洿鎺ュ崌绾?Git锛?   - 瀹?*娌℃湁**鏂扮増鑷甫鐨?Git Credential Manager锛宲ush 鏃朵細瑕佹眰璐﹀彿瀵嗙爜锛岃€?GitHub 鏃╁氨涓嶆帴鍙楀瘑鐮佷簡锛屼細鎶?     `Support for password authentication was removed`銆?   - **寤鸿鍏堝崌绾?*锛堣瀹岄噸寮€缁堢锛夛細

     ```powershell
     winget install --id Git.Git -e --source winget
     ```

     鎴栬€呭幓 https://git-scm.com/download/win 涓嬭浇瀹夎锛屼竴璺粯璁ゅ嵆鍙€傚崌绾у悗涓嬮潰鐨勫懡浠ゅ叏閮ㄧ収鎶勩€?2. **Git 韬唤娌￠厤缃繃**锛歚git config --global user.name` 鏄┖鐨勶紝`git commit` 浼氱洿鎺ユ姤閿欍€傜 1 姝ュ氨鏄厤瀹冦€?
> 鍙﹀锛氭湰鍦颁粨搴?*宸茬粡鍒濆鍖栧ソ浜?*锛坄git init` + 鍒嗘敮 `main` + `git add -A` 閮藉仛瀹屼簡锛?32 涓枃浠跺凡鏆傚瓨锛夛紝
> 浣犱粠銆岄厤缃韩浠?鈫?鎻愪氦銆嶈繖涓€姝ユ帴鐫€鍋氬氨琛屻€?
## 0. 鍏堢‘璁や笁浠朵簨

1. **鏈湴鑳借窇**锛氫粨搴撶洰褰曢噷鎵ц

   ```powershell
   cd C:\Users\chenhw\Documents\deepseek-harness\default-workspace\dsh-aha-tail
   node test/host.test.mjs
   ```

   鍏ㄧ豢鍐嶅線涓嬭蛋銆?
2. **鍗犱綅绗︽敼鎺?*锛歚package.json` 閲屾湁 4 涓?`chenhw-hjm`锛孯EADME 閲屾湁浠撳簱鍦板潃鍗犱綅銆?
   ```powershell
   Select-String -Path package.json,README.md -Pattern 'chenhw-hjm' -SimpleMatch
   ```

   - `author`锛氫綘鐨勫悕瀛楁垨 GitHub 鐢ㄦ埛鍚?   - `repository.url` / `bugs.url` / `homepage`锛歚https://github.com/浣犵殑鐢ㄦ埛鍚?dsh-aha-tail`

   涓€鏉″懡浠ゆ壒閲忔崲锛堟妸 `YOURNAME` 鎹㈡垚浣犵殑 GitHub 鐢ㄦ埛鍚嶏級锛?
   ```powershell
   (Get-Content package.json -Raw).Replace('chenhw-hjm', 'YOURNAME') | Set-Content package.json -NoNewline
   (Get-Content README.md -Raw).Replace('chenhw-hjm', 'YOURNAME') | Set-Content README.md -NoNewline
   ```

3. **瑁?Git**锛歚git --version` 鏈夎緭鍑虹増鏈彿灏辫锛涙病鏈夊氨鍘?https://git-scm.com/download/win 瑁呫€?
## 1. 閰嶇疆 Git 韬唤锛堝彧闇€涓€娆★級

```powershell
git config --global user.name "浣犵殑鍚嶅瓧"
git config --global user.email "浣犵殑閭@example.com"
```

閭寤鸿鐢?GitHub 璐﹀彿鐨勯偖绠憋紙鎴?GitHub 鎻愪緵鐨?`xxx@users.noreply.github.com`锛夈€傝繖涓ら」浼氬啓杩涙瘡涓?commit銆?
## 2. 寤轰竴涓┖浠撳簱

**缃戦〉鏂瑰紡**

1. 鎵撳紑 https://github.com 锛岀櫥褰曪紙娌℃湁灏辨敞鍐岋級銆?2. 鍙充笂瑙?`+` 鈫?**New repository**銆?3. 濉細
   - Repository name锛歚dsh-aha-tail`
   - Description锛歚A DSH plugin that drops a sticker after every finished reply.`
   - 閫?**Public**
   - **涓嶈**鍕?"Add a README file" / ".gitignore" / "license"鈥斺€旀湰鍦板凡缁忛兘鏈変簡锛屽嬀浜嗕細璺熸湰鍦板啿绐併€?4. **Create repository**锛岄〉闈細缁欎綘涓€娈靛懡浠わ紝鍏堝埆鎬ョ潃鐓ф妱锛堜笅闈㈡槸鏈湴宸叉湁鏂囦欢鏃剁殑姝ｇ‘鐗堟湰锛夈€?
**鎴栬€呯敤 GitHub CLI锛堣浜?`gh` 鐨勮瘽涓€琛屾悶瀹氾級**

```powershell
cd C:\Users\chenhw\Documents\deepseek-harness\default-workspace\dsh-aha-tail
gh auth login          # 绗竴娆＄敤锛氶€?GitHub.com 鈫?HTTPS 鈫?娴忚鍣ㄦ巿鏉?gh repo create dsh-aha-tail --public --source=. --remote=origin --push
```

鐢?`gh repo create` 鐨勮瘽锛岀 3銆? 姝ラ兘宸茬粡鏇夸綘鍋氬畬浜嗭紝鍙互鐩存帴璺冲埌绗?5 姝ョ湅缁撴灉銆?
## 3. 鎻愪氦锛堜粨搴撳凡缁忓垵濮嬪寲濂斤紝鐩存帴 commit锛?
浠撳簱鏍圭洰褰曪紙鏈?`package.json` 鐨勯偅涓€灞傦級閲岋紝`git init` / 鍒嗘敮 `main` / `git add -A` 閮藉凡缁忓仛瀹屼簡锛?
```powershell
cd C:\Users\chenhw\Documents\deepseek-harness\default-workspace\dsh-aha-tail
git commit -m "feat: Aha sticker tail plugin"
```

妫€鏌ヤ竴涓嬫彁浜や簡浠€涔堬紙绱犳潗 517 涓枃浠躲€佺害 9 MB锛屽睘姝ｅ父锛夛細

```powershell
git show --stat --oneline HEAD | Select-Object -First 15
git count-objects -vH
```

> 濡傛灉鎹㈡満鍣ㄣ€佹垨璇垹浜?`.git` 瑕佷粠闆舵潵涓€閬嶏紙鏃х増 Git 鐢ㄨ繖涓よ锛夛細
>
> ```powershell
> git init
> git checkout -b main          # 鏂扮増 Git(鈮?.28) 鍙互涓€姝?git init -b main
> git add -A
> git commit -m "feat: Aha sticker tail plugin"
> ```
>
> `warning: LF will be replaced by CRLF` 鏄?Windows 鎹㈣杞崲鎻愮ず锛屾甯革紝鍙互蹇界暐銆?
**涓嶈琚彁浜?*锛歚node_modules/`銆乣.DS_Store`銆佷复鏃舵棩蹇椻€斺€擿.gitignore` 宸茬粡鎸℃帀浜嗐€?
## 4. 鍏宠仈杩滅▼骞舵帹閫?
```powershell
git remote add origin https://github.com/浣犵殑鐢ㄦ埛鍚?dsh-aha-tail.git
git push -u origin main
```

绗竴娆?push 浼氬脊鍑虹櫥褰曠獥鍙ｏ紙Git Credential Manager锛夛紝鎸夋彁绀哄湪娴忚鍣ㄩ噷鎺堟潈鍗冲彲銆?
### 璁よ瘉鏂瑰紡锛堜笁閫変竴锛岄亣鍒伴棶棰樺啀鏉ヨ锛?
- **寮圭獥鎺堟潈锛圵indows 涓婃渶鐪佷簨锛?*锛欸it for Windows 鑷甫 Credential Manager锛宲ush 鏃剁偣 "Sign in with your browser"銆?  濡傛灉娌″脊绐楋紝鎵ц涓€娆?`git config --global credential.helper manager` 鍐?push銆?- **Personal Access Token**锛欸itHub 鈫?鍙充笂澶村儚 鈫?Settings 鈫?Developer settings 鈫?Personal access tokens 鈫?Tokens (classic) 鈫?Generate new token锛?  鍕?`repo`锛屽鍒剁敓鎴愮殑 `ghp_...`銆俻ush 鏃剁敤鎴峰悕濉?GitHub 鐢ㄦ埛鍚嶏紝**瀵嗙爜绮樿创 token**銆?- **SSH**锛堥暱鏈熸渶绋筹級锛?
  ```powershell
  ssh-keygen -t ed25519 -C "浣犵殑閭"     # 涓€璺洖杞?  Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
  ```

  鎶婅緭鍑虹殑鍏挜璐村埌 GitHub 鈫?Settings 鈫?SSH and GPG keys 鈫?New SSH key锛?  鐒跺悗鎶婅繙绋嬪湴鍧€鎹㈡垚 SSH 褰㈠紡锛?
  ```powershell
  git remote set-url origin git@github.com:浣犵殑鐢ㄦ埛鍚?dsh-aha-tail.git
  ```

> GitHub 鏃╁凡涓嶆敮鎸佺敤**璐﹀彿瀵嗙爜** push銆傛姤 `Support for password authentication was removed` 灏辨槸娌¤蛋涓婇潰涓夌璁よ瘉銆?
## 5. 纭鍙戝竷鎴愬姛

鍒锋柊浠撳簱椤甸潰锛屽簲褰撹兘鐪嬪埌锛?
- 鏂囦欢鍒楄〃锛歚index.js`銆乣client.js`銆乣scan.js`銆乣cordis.patch.yml`銆乣assets/`銆乣README.md` 鈥?- README 琚覆鏌撳嚭鏉ワ紙涓枃姝ｅ父鏄剧ず锛?- 鍙充晶 About 閲屽彲浠ュ姞涓€鍙ユ弿杩板拰 topic锛歚dsh-plugin`銆乣sticker`銆乣deepseek-harness`锛堢偣榻胯疆 鈫?Description/Topics锛?
## 6. 涔嬪悗鎬庝箞鏇存柊

```powershell
git add -A
git commit -m "fix: 淇 XX"
git push
```

鏀逛簡鍔熻兘鎯冲崌鐗堟湰鍙凤紙鍙€夛紝浣嗚鑼冿級锛?
```powershell
npm version patch     # 0.2.0 -> 0.2.1锛沵inor/major 鍚岀悊锛堥渶瑕佽浜?Node/npm锛?git push --follow-tags
```

## 7. 鍙戜竴涓?Release锛堝彲閫夛紝鏂逛究鍒汉涓嬭浇 zip锛?
```powershell
git tag v0.2.0
git push origin v0.2.0
```

鐒跺悗浠撳簱椤?鈫?**Releases** 鈫?**Draft a new release** 鈫?閫?`v0.2.0` 鈫?鏍囬 `v0.2.0` 鈫?鍐欏彉鏇磋鏄?鈫?**Publish release**銆?鍒汉灏辫兘鍦?Releases 閲岀洿鎺ヤ笅 Source code (zip)銆?
## 8. 鍒汉鎬庝箞鐢ㄤ綘鐨勯」鐩?
鍐欒繘 README 灏卞浜嗭紙褰撳墠 README 宸茬粡鍐欎簡锛夛細

```powershell
git clone https://github.com/浣犵殑鐢ㄦ埛鍚?dsh-aha-tail.git C:\dsh-plugins\dsh-aha-tail
```

鐒跺悗鍦?DSH 閲岃 Agent 鐢?`plugin_manager install_bundle` 瑁?`C:\dsh-plugins\dsh-aha-tail` 杩欎釜**鐩綍璺緞**锛屽埛鏂伴〉闈€?锛堟湰鍦扮洰褰曞畨瑁呮槸閾炬帴寮曠敤锛岃瀹屽埆鍒犻偅涓洰褰曘€傦級

## 9. 甯歌鎶ラ敊

| 鎶ラ敊 | 鍘熷洜 / 瑙ｅ喅 |
| --- | --- |
| `remote: Support for password authentication was removed` | 鐢ㄤ簡璐﹀彿瀵嗙爜銆傛敼鐢ㄥ脊绐楁巿鏉?/ PAT / SSH |
| `src refspec main does not match any` | 杩欎釜浠撳簱杩樻病 commit銆傚厛 `git add -A; git commit -m "init"` |
| `fatal: not a git repository` | 涓嶅湪浠撳簱鐩綍閲岋紝`cd` 鍒版湁 `.git` 鐨勯偅灞?|
| `error: remote origin already exists` | 宸茬粡鏈?origin 浜嗭紝鐢?`git remote set-url origin <鏂板湴鍧€>` |
| `fsmonitor--daemon` / 鏉冮檺鎬敊 | 鍏虫帀鏉€杞 `.git` 鐨勫疄鏃舵壂鎻忥紝鎴?`git config --global core.fsmonitor false` |
| `file is 100.00 MB; this exceeds GitHub's file size limit` | 鍗曚釜鏂囦欢瓒?100 MB 琚嫆銆傛湰椤圭洰鐨勭礌鏉愬凡鍘嬪埌杩滃皬浜庢锛屾甯镐笉浼氶亣鍒?|
| push 寰堟參 / 鍗′綇 | 绱犳潗鍑犲崄 MB锛岄娆℃帹閫佹參鏄甯哥殑锛涘浗鍐呯綉缁滃彲浠ヨ€冭檻缁?git 閰嶄唬鐞?|

## 10. 鍏充簬浠撳簱浣撶Н

- GitHub 鍗曚釜鏂囦欢涓婇檺 **100 MB**锛屼粨搴撳缓璁?**< 1 GB**銆傛湰椤圭洰绱犳潗鍘嬪畬鏄嚑鍗?MB锛屼笉闇€瑕?Git LFS銆?- 濡傛灉浠ュ悗鎯冲姞鏇村绱犳潗锛氱户缁敤 `scripts/build-assets.py` 鍘嬪埌 WebP 鍐嶆彁浜わ紝**涓嶈**鐩存帴鎻愪氦鍘熷 PNG銆?
## 11. 鍙戝竷鍓嶇殑鐗堟潈妫€鏌?
`assets/` 閲屾槸鍒汉鐨勮〃鎯呭寘銆?*鍏紑鍙戝竷鎰忓懗鐫€浣犲湪鍒嗗彂杩欎簺鍥剧墖**锛岃鍏堢‘璁わ細

- 浣犳湁鏉冨垎鍙戣繖濂楃礌鏉愶紙鑷繁鐢荤殑 / 鏄庣‘鎺堟潈鐨?/ 鎴栬€呭彧浣滀负绀轰緥涓旀敞鏄庢潵婧愶級锛?- 鎴栬€呮妸 `assets/` 鎹㈡垚浣犺嚜宸辨媿鐨?鑷繁鐢荤殑鍥撅紝鍐嶅彂甯冦€?
README 鍜?LICENSE 鏈熬宸茬粡鍐欎簡杩欐璇存槑锛屾寜浣犵殑瀹為檯鎯呭喌鏀广€?