# fedep

前端依賴安裝器 ( Frontend Dependency Installer )，同時支援 npm 及 GitHub release 發布。套件名稱為 `fedep` ( 無 scope )，在 plotdb 生態系中通常以 `npx fedep` 執行。


## 安裝與執行

    npm install -g fedep
    # 或在專案內
    npx fedep

也可加在 `postinstall` 自動執行：

    "scripts": { "postinstall": "./node_modules/.bin/fedep" }


## 主要指令

 - `fedep`：依 `package.json` 的 `frontendDependencies` 安裝前端依賴
 - `fedep init`：互動式產生 `frontendDependencies` 設定
 - `fedep publish`：發布到 npm
 - `fedep publish -g`：發布到 GitHub release
 - `fedep license`：生成 LICENSE 檔案


## 前端依賴安裝


### package.json 設定

    "frontendDependencies": {
      "root": "web/static/assets/lib",
      "modules": [
        "ldview",
        { "name": "@loadingio/ldquery" },
        { "name": "bootstrap", "dir": "dist" }
      ]
    }


### 安裝邏輯

fedep 從 `node_modules` 複製套件到 `{root}/{模組名}/{版本}/`，並建立 `{root}/{模組名}/main` symlink 指向該版本。複製來源優先順序：

 - 若有 `dir` 欄位，複製套件內的指定子目錄
 - 否則若 `dist` 存在且有 `--use-dist` flag，複製 `dist/`
 - 否則複製整個套件


### 安裝後目錄結構

    web/static/assets/lib/
      ldview/
        1.7.2/       ← 從 node_modules/ldview 複製
        main -> 1.7.2  ← symlink

`+script({name: "ldview"})` → `/assets/lib/ldview/main/index.min.js`

`main` symlink 讓 `+script`/`+css` mixin 永遠用 `main/` 引用，不需隨版本升級改路徑。


### 模組物件欄位

模組清單中的每個項目可以是字串 ( 模組名稱 ) 或物件；物件格式包含以下欄位：

 - `name`：npm 套件名稱，含 scope ( 如 `@loadingio/ldquery` )
 - `dir`：只複製套件內的指定子目錄 ( 如 `"dir": "dist"` )
 - `link`：`true` 時用 symlink 取代複製，適合本地開發；若有 `browserify` 則強制為 `false`
 - `optional`：`true` 時找不到不報錯，即使不在 `optionalDependencies` 中
 - `browserify`：`true` 或 object，對模組跑 browserify 打包；若為 object，其內容作為 browserify 選項
 - `transpile`：需要 transpile 模組時加入，含 `files` 欄位 ( 要 transpile 的檔案清單 )


### 本地 repo 開發

開發中的套件可以用 `-l` 直接指向本地目錄，fedep 會建立 symlink 取代複製：

    npx fedep -l "iconsuite:/path/to/iconsuite"

多個模組用 `;` 分隔：

    npx fedep -l "mod1:path-to-mod1;mod2:path-to-mod2"

路徑支援 `~` 展開。


### 指令選項

 - `-s` / `--symlink`：用 symlink ( 預設 `true` )
 - `-l module:path`：指定本地路徑


## fedep init

互動式在 `package.json` 加入 `frontendDependencies` 欄位，從現有 `dependencies` 建立模組清單。產生後仍需手動確認各模組設定是否正確。

    npx fedep init


## fedep publish ( npm )

將 `dist/` 及核心檔案合併到 `.fedep/publish/`，再執行 `npm publish --access public .fedep/publish`。

合併內容包含：

 - `dist/` 的內容 ( 移到根目錄 )
 - `README.md`、`CHANGELOG.md`、`package.json`、`LICENSE`
 - `package.json` 中 `files` 欄位列出的其他檔案 ( 保留原目錄結構，`dist` 除外 )

`package.json` 的以下欄位會自動調整路徑 ( 去掉 `dist/` 前綴 )：`main`、`style`、`browser`、`module`、`unpkg`，`files` 欄位則移除。

選項：

 - `--skip-dist`：無 `dist/` 時，只發布 `files` 欄位列出的檔案
 - `--folder another-dist`：指定不同的 dist 資料夾名稱
 - `--dup true`：保留 `dist/` 資料夾 ( 不移到根目錄 )

注意：`package.json` 的 `scripts` 中不要用 `publish` 作為 script 名，因為 npm 會攔截；建議用 `release`：

    "scripts": {
      "release": "npx fedep publish; npx fedep publish -g"
    }


## fedep publish -g ( GitHub Release )

不走 npm，改走 GitHub release。

    npx fedep publish -g              # 推送到 release branch + 建 GitHub release
    npx fedep publish -g release      # 同上 ( 明確指定 branch 名 )
    npx fedep publish -g --skip-dist  # web 專案無 dist 時用此 flag


### 完整流程

 1. 準備 work folder `.fedep/publish/` ( 同 npm publish 的合併邏輯 )
 2. 從 `package.json` 的 `version` 欄位讀取版本號 ( 需符合 `x.y.z` 格式 )
 3. 從 `CHANGELOG.md` 解析對應版本的 release notes
 4. 確認 `gh` CLI 已登入 ( `gh status` )
 5. 確保 release branch 存在 ( 本地/遠端都沒有時，從當前 branch 建立 )
 6. 更新 release branch：
    - `git worktree add .fedep/_public release`
    - 清空舊內容 ( `git rm -r *` )
    - 複製 work folder 內容
    - `git add -f * && git commit -m "regen" && git push`
 7. 建立 GitHub release ( `gh release create dist/v{version} --target release --title {version} --notes-file -` )；release notes 從 CHANGELOG.md 解析後透過 stdin 傳入，若 CHANGELOG 無對應 section 改用 `--generate-notes`
 8. 在當前的 source commit 上打 `src/v{version}` 並 push ( fedep 1.8.0 起 )。tag 已存在時略過，不覆寫

兩個 tag 的命名慣例與適用情境見 [3.version-control.md](../../3.version-control.md) 的「Tag 命名」。走 npm 的 `fedep publish` 不打 tag。


### 前提條件

 - `package.json` 有 `version` 欄位 ( semver `x.y.z` )
 - `gh` CLI 已安裝並登入 ( `gh auth login` )
 - git remote `origin` 已設定
 - 若無 `--skip-dist`：`dist/` 資料夾存在


### CHANGELOG.md 格式

    ## v0.0.2

     - bug fixes:
       - fix something

    ## v0.0.1

     - init release

解析邏輯：找第一個包含版本號字串的行作為開始，收集後續行直到遇到下一個 `#+\s+v?\d+\.\d+\.\d+` 格式的標題，去掉頭尾空白行後作為 release notes。`package.json` 的 `version` 必須與 CHANGELOG.md 中對應 section 的版本號一致。


### web 專案推薦設定

對於無 build step 的 web 專案，在 `package.json` 設定：

    {
      "version": "0.1.0",
      "files": ["web/", "CHANGELOG.md"]
    }

然後執行：

    npx fedep publish -g --skip-dist

與手動 `git tag` 相比，fedep 自動建立 GitHub release 並從 CHANGELOG.md 取得格式化的 release notes，且 release branch 提供乾淨的發布快照。


## 發布組合與安裝端效果

publish 的效果依「是否上 npm」與「是否有 dist」而不同。共通點：兩種模式都先在 `.fedep/publish/` 組出發布內容 ( `dist/` 內容攤平到根目錄、`main` / `browser` / `style` / `module` / `unpkg` / `bin` / `exports` 路徑欄位改寫、`files` 欄位移除 )，差別在這份內容送去哪裡。


### 有 dist、上 npm ( `fedep publish` )

 - 發布內容推上 npm；安裝端 `npm install <name>`，unpkg 亦可直接引用 ( `unpkg.com/<name>/index.min.js`，因 dist 已攤平 )
 - repo 的 master 可以把 `dist/` 放進 `.gitignore`，發布內容與 repo 內容無關


### 有 dist、不上 npm ( `fedep publish -g` )

 - 發布內容推到 `release` branch 並建 GitHub release；tag `dist/vX.Y.Z` 指向 release branch，`src/vX.Y.Z` 指向產生它的 source commit
 - 安裝端要裝 `github:<user>/<repo>#release` ( 或 `#dist/vX.Y.Z` )，拿到的內容等同 npm 發布版。committish 含斜線不影響 npm 解析
 - fedep 1.8.0 以前的裸 `vX.Y.Z` tag 指向 release branch，維持原狀不改名
 - 注意：裝 `#master` 拿到的是原始 repo — 若 `dist/` 沒 commit 進 master 就沒有 build 產物，且 `package.json` 路徑欄位仍指向 `dist/`，通常無法直接使用。不上 npm 的專案請引導使用者裝 `#release` 或 tag，或把 dist commit 進 master


### 無 dist ( `--skip-dist`，web 專案或純源碼專案 )

 - 發布內容 = `files` 欄位列出的檔案 + README / CHANGELOG / package.json / LICENSE，目錄結構原樣，路徑欄位不改寫
 - master 與 release branch 內容基本一致，安裝端裝 `#master` 也可用 ( 如 `github:plotdb/guides#master` )
 - 無 dist 專案也可上 npm：`fedep publish --skip-dist`
 - 忘記 `--skip-dist` 時 fedep 會因 `dist/` 不存在直接結束，不會發布


## 眉角與常見陷阱


### `dir` 欄位：複製的是內容，不是目錄本身

設定 `"dir": "dist"` 時，fedep 複製的是 `dist/` 目錄**內的檔案**，而非連 `dist/` 資料夾一起複製。

安裝後的結構：

    # "dir": "dist" 的情況
    web/static/assets/lib/bootstrap/main/
      css/bootstrap.min.css    ← 直接在 main/ 下，無 dist/ 層
      js/bootstrap.bundle.min.js

    # 未設定 dir ( 複製整個套件 )
    web/static/assets/lib/bootstrap/main/
      dist/css/bootstrap.min.css   ← 有 dist/ 層
      dist/js/bootstrap.bundle.min.js
      package.json
      src/...

因此 `+css` / `+script` 的 `path` 對應方式不同：

    # 有 "dir": "dist"
    +css([{name: "bootstrap", path: "css/bootstrap.min.css"}])

    # 無 dir ( 複製整包 )
    +css([{name: "bootstrap", path: "dist/css/bootstrap.min.css"}])

**建議做法**：使用 `dir` 時，把套件名稱搭配 `dir: "dist"` 一起設，只複製有用的 dist 檔，省空間且路徑直觀。


### `fedep init` 會把後端套件也加進去

`fedep init` 從 `package.json` 的 `dependencies` 互動式建立清單，但它不區分前端/後端套件，會把 `express`、`better-sqlite3`、`cheerio` 等 Node.js 後端套件也列進 `frontendDependencies`。

執行完後必須手動刪除後端套件，只保留真正要複製到瀏覽器的前端庫：

    # 不需要的 ( 刪除 )
    "express", "better-sqlite3", "cheerio", "node-fetch"

    # 需要的 ( 保留 )
    { "name": "bootstrap", "dir": "dist" },
    "ldview",
    "@loadingio/ldquery"


### `+script` / `+css` 的 path 預設值

srcbuild 的 `+script`/`+css` mixin 省略 `path` 時預設為 `index.min.js` / `index.min.css`。多數套件有這個檔名，但 bootstrap 沒有，必須明確指定：

    # 正確
    +css([{name: "bootstrap", path: "css/bootstrap.min.css"}])

    # 錯誤 ( bootstrap 無 index.min.css )
    +css([{name: "bootstrap"}])


## fedep license

依 `package.json` 的 `license` 欄位 ( 或命令列參數 ) 生成 LICENSE 檔案。

支援的授權類型：`mit`、`isc`、`apache`、`bsd`、`agpl`。
