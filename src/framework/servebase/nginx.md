# servebase Nginx 設定

servebase 專案使用 `npx tt` (template-text) 從 YAML config 和 `.ngx` template 產生 nginx config，輸出到 `config/gen/nginx/`，再 symlink 到 devsuite 的 `nginx/sites/`。


## 目錄結構

 - `config/base/nginx/` — servebase upstream 提供的 template (`config.ngx`) 和 build script
 - `config/<name>/nginx/` — 本站設定 (YAML config + 複製的 template)
 - `config/<name>/build` — build script (從 `config/base/build` 複製)
 - `config/gen/nginx/` — 產生的輸出，不入 git


## 建立新站設定

從 `config/base/nginx/` 複製 template 和 build script：

    cp config/base/nginx/config.ngx config/<name>/nginx/config.ngx
    cp config/base/build config/<name>/build

建立 YAML config (以 `<hostname>.yaml` 命名)：

    name: <name>
    ip: 127.0.0.1
    port: <port>
    hostname: <hostname>
    root: /path/to/frontend/<name>/static/
    cert:
      crt: /path/to/cert/<hostname>/server.crt
      key: /path/to/cert/<hostname>/server.key
    nginxCfgDir: /opt/homebrew/etc/nginx


## 產生 config

從 `config/<name>/` 執行，config 和 template 都需要帶副檔名 (`npx tt` 要求)：

    cd config/<name>
    ./build nginx/<hostname>.yaml nginx/config.ngx <hostname>.ngx

輸出到 `config/gen/nginx/<hostname>.ngx`。


## Symlink 到 devsuite

    ln -sf /path/to/server/config/gen/nginx/<hostname>.ngx \
           /Users/.../devsuite/nginx/sites/<hostname>.ngx

Symlink 指向 gen 輸出，重新 build 後不需要重建 link，`nginx -s reload` 即生效。


## 修改後更新流程

 1. 修改 `config/<name>/nginx/<hostname>.yaml` 或 `config.ngx`
 2. 重新執行 build
 3. `nginx -s reload`


## Port 慣例

若同一台開發機同時跑多個 servebase 服務 (含 servebase demo 本身)，各服務需使用不同 port 避免衝突。servebase demo 預設使用 `8901`，新專案應選其他 port (如 `8910`、`8920` 等)。

Port 設定位置：`config/<name>/nginx/<hostname>.yaml` 的 `port` 欄位，和 `config/private/secret.ls` 的 `port` 欄位需保持一致。
