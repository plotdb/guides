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

    npm run stop

`./start` 啟動時會把自己的 PID 寫進 `.server.pid`（git-ignored）。`npm run stop` 讀這個檔案，先 kill 該 PID，再以 `pkill -TERM -P` 清掉它的子程序（node、`pino-pretty`），整個 process group 一併結束，自動重啟迴圈也隨之終止。

找不到 `.server.pid` 時會提示 `no .server.pid found; server not running?`。


### 手動識別 process

只有在 `.server.pid` 遺失（例如 server 以其他方式啟動）時才需要手動找。開發機上可能同時跑多個 servebase server，start script 與 node process 都帶有可辨識的名稱：

    # start script 的 argv[0] 為 start:<dirname>
    ps aux | grep "start:"

    # node process 的 process.title 為 servebase:<dirname>[:<sitename>]
    ps aux | grep "servebase:"

仍不確定時，可用 `lsof` 確認工作目錄：

    lsof -p <PID> | awk '$4=="cwd"{print $9}'

確認後 kill start script 的 PID 即可，`kill 0` trap 會連帶殺掉子程序。若只 kill node process，`./start` 會在 1 秒後自動重啟。


## 重啟

    npm run stop && npm run dev

後端 `.ls` 檔修改後需重啟才生效（非 pug/styl/前端 ls，那些 auto-rebuild）。

若只是想讓 start loop 重新拉起 server，kill node process（`servebase:<dirname>`）即可，1 秒後自動重啟，不必重跑 `npm run dev`。


## 以 service 執行

    ./start --noloop

`--noloop`（或 `-n`）只執行 server 一次，不進自動重啟迴圈，把重啟交給 systemd 等 service manager 的 `Restart=always`。systemd unit 範例見 servebase 專案的 `doc/base/infrastructure.md`。


## 查看 log

server 輸出同時寫入專案目錄下的 `server.log`（pino ndjson 格式）。`npm run log` 是它的檢視工具（`tool/base/logview`）：

    npm run log                              # follow，等同 tail -f
    npm run log -- -n 500                    # 最後 500 行，在 less 中檢視
    npm run log -- -a                        # 整個檔案
    npm run log -- -f -n 500                 # 從最後 500 行開始 follow
    npm run log -- -m db                     # 只看 module 為 db 的紀錄
    npm run log -- -l 40                     # 只看 level >= 40（30 info / 40 warn / 50 error）
    npm run log -- -g 'timeout'              # 以 regex 過濾（比對格式化前的原始 json）
    npm run log -- -d 3                      # 最近 3 天
    npm run log -- -s 20260810 -e 20260817   # 指定日期區間（UTC，含頭尾）

日期選項若未同時給 `-n` 或 `-a`，會掃描整個檔案。完整說明可用 `npm run log -- -h`。


## 更新 cachestamp

    npm run cachestamp

cachestamp 是前端資源的快取戳記，預設為 server 啟動時間。此指令透過 `.localctl.sock` 通知執行中的 server 換一組新的戳記，讓前端資源立即失效，不需重啟 server。


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

 - 停止時一律在該專案目錄下執行 `npm run stop`，它只認該專案的 `.server.pid`，不會誤殺別的 server
 - 需要手動辨識時，`ps` 中的 `start:<dirname>` 與 `servebase:<dirname>` 已足以區分專案
 - 各專案的 server log 都寫在各自專案目錄下的 `server.log`
 - 各專案使用不同 port，可透過 nginx/host 設定區分


## 設定檔

    config/
      private/
        secret.ls    # 預設使用的設定（git-ignored）
        demo.ls      # 範例設定

啟動時以位置參數指定設定檔名（對應 `config/private/<name>.ls`），`./start` 會轉成 `-c <name>` 傳給 server：

    ./start base   # 使用 config/private/base.ls
    npm run demo   # 同上，已包成 npm script
    npm run dev    # 不帶參數，使用 config/private/secret.ls

`tool/base/database/init.ls` 也依循同一套命名慣例，見 [資料庫初始化](database.md)。


## 相關主題

 - [Pug 開發](pug.md) — frontend pug 結構、mixin 來源、`@/` 路徑解析、fedep 整合
 - [Nginx 設定](nginx.md) — 從 YAML 產生 nginx config、symlink 到 devsuite、port 慣例
 - [資料庫初始化](database.md) — DB init 腳本流程、psql 執行注意事項
