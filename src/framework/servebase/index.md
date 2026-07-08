# servebase - Server 管理指南

基於 `@servebase` 框架的 Express.js 應用伺服器（loading/v3 等專案）的啟動、停止、重啟與日常維護說明。


## 啟動

    # 開發模式（監聽 src 變更、自動 rebuild pug/ls/styl）
    npm run dev

    # 生產模式（使用預建的 .backend/ 目錄）
    npm start

兩者都執行 `./start` script。


### `./start` 的行為

 - 持續循環：server 退出後自動重啟（1 秒後）
 - dev 模式執行 `lsc ./backend/engine/index`（即時編譯 LiveScript）
 - prod 模式執行 `node ./.backend/engine/index.js`（需先 `npm run prebuild`）
 - 標準輸出通過 `pino-pretty` 美化，同時寫入 `server.log`

    # trap "kill 0" exit → 按 Ctrl-C 會殺掉整個 process group（包含子程序）


## 停止

注意：環境中可能同時有多個類似的 server（grantdash、jiemu 等），停錯 process 會造成其他服務中斷。


### 識別正確的 process

    # 列出所有 lsc ./backend/engine/index 程序
    ps aux | grep "engine/index"

    # 用 lsof 確認工作目錄，避免誤殺
    lsof -p <PID> | awk '$4=="cwd"{print $9}'
    # 輸出應為 /Users/.../loading/v3 才是正確的 process


### 停止方式

    # 找到 start script 的 PID（parent）
    ps aux | grep "./start"

    # 或找 engine/index 的 PID
    kill <PID>
    # kill 0 trap 會自動連帶殺掉子程序

停止 `./start` 的 parent process 後，自動重啟迴圈也會終止。若只 kill `engine/index`，`./start` 會在 1 秒後自動重啟。


## 重啟

    # 法 1：讓 start loop 自動重啟（kill engine/index process 即可）
    kill <engine-index-PID>

    # 法 2：完全停止再重跑
    kill <start-PID>   # 殺 start script（含子程序）
    npm run dev        # 重新啟動

後端 `.ls` 檔修改後需重啟才生效（非 pug/styl/前端 ls，那些 auto-rebuild）。


## 前端自動 rebuild

dev 模式下，以下類型的檔案修改不需要重啟 server：

 - Pug：`frontend/web/src/pug/**/*.pug`。說明：修改後自動重新編譯
 - LiveScript (前端)：`frontend/web/src/pug/**/*.ls`。說明：同上
 - Stylus：`frontend/web/src/pug/**/*.styl`。說明：同上

若 pug 自動 rebuild 沒觸發，可強制 touch：

    touch frontend/web/src/pug/some/page/index.pug

後端 `backend/**/*.ls` 修改後必須重啟 server。


## 後端路由模組

路由模組放在 `backend/` 下各子目錄（engine 除外），在 `backend/engine/index.ls` 中自動掃描載入：

    backend/
      engine/    # 主程式入口，不作為 route 載入
      ldio/      # loading.io 相關路由（如 iconcat.ls）
      base/      # 基礎路由
      admin/     # 管理後台路由
      ext/       # 擴充路由（optional）

新增路由模組只需在對應目錄建立 `index.ls`，系統會自動掃描並 require。

模組格式：

    require! <[lderror @servebase/backend/aux]>

    (backend) <- (->module.exports = it) _
    <-(->it.apply backend) _
    {db, config, route: {api, app}} = @

    app.get \/some/path, (req, res) ->
      res.render \view/index.pug, {exports: {data}}


## viewlocals（傳遞資料給前端 JS）

後端傳 `exports` 物件到模板，前端透過 `ldc.register(['viewlocals'], ...)` 取得：

    # backend
    res.render \view/index.pug, {cat, exports: {cat}}

    # frontend pug（在 block script 中）
    - var exports = {cat: cat};
    +register-locals()
    script(type="module"): include:lsc index.ls

    # frontend ls
    ({viewlocals}) <- ldc.register <[viewlocals]>, _
    cat = viewlocals.cat

`+register-locals()` mixin 會把 `locals["exports"]` 序列化成 `ldc.register` 呼叫，注入到 HTML 中。


## Node.js 版本管理

某些 native module（如 `canvas`）對 Node.js 版本敏感，需指定版本。

    # 切換版本（以 loading/v3 為例）
    n 21.7.1

    # 確認目前版本
    node -v

`NODE_MODULE_VERSION` 不符時會出現類似錯誤：

    Error: The module .../canvas.node was compiled against a different Node.js version

解法：切回正確的 Node.js 版本，或重新 `npm install` 讓 native module 重編。


## 多 server 環境注意事項

開發機上可能同時跑多個 servebase-based server（如 grantdash/v2、jiemu/server、loading/v3）。

 - 確認工作目錄再 kill：`lsof -p <PID> | awk '$4=="cwd"{print $9}'`
 - 各專案的 server log 都寫在各自專案目錄下的 `server.log`
 - 各專案使用不同 port，可透過 nginx/host 設定區分


## 設定檔

    config/
      private/
        secret.ls    # 預設使用的設定（git-ignored）
        demo.ls      # 範例設定

啟動時透過 `-c <name>` 指定設定檔（對應 `config/private/<name>.ls`）：

    ./start base   # 使用 config/private/base.ls
    npm run dev    # 不帶參數，使用 config/private/secret.ls
