# servebase 資料庫初始化

servebase 專案的 DB 初始化腳本放在 `tool/base/database/init.ls`，以 LiveScript 寫成，執行方式：

    lsc tool/base/database/init.ls

與 `./start` 相同，可用 `-c <name>` (或 `--config-name`) 指定要讀哪一份 private config，讓同一個 repo 底下的多組站台設定各自初始化對應的資料庫。未指定時使用 `secret`：

    lsc tool/base/database/init.ls -c base   # 讀 config/private/base.ls


## 初始化流程

 1. 建立 role (若已存在則跳過，使用 `DO $$ ... $$` block 判斷)
 2. 建立 database (先查 `pg_database` 確認不存在再建立)
 3. 執行 `config/base/db/init.sql` (schema 定義)
 4. 若所選的 private config 有 `base` 欄位，依字典序執行 `config/<base>/db/*.sql`
 5. 對 app user 授予 schema public 完整權限


## SQL 執行方式：使用 temp file

psql 命令透過 temp file 傳入 SQL (`-f`)，而非 `-c` 直接帶入字串。原因：

 - shell 的 `$$` 會被展開為目前 process 的 PID，破壞 `DO $$ ... $$` 語法
 - `-c` 模式不支援 `\gexec` 等 psql 互動指令

做法：把 SQL 寫入 `os.tmpdir()` 下的臨時檔，再用 `psql -U postgres -d <db> -f <file>` 執行，執行後刪除。


## `CREATE DATABASE` 不能在 DO block 裡

PL/pgSQL 的 `DO $$ ... $$` block 不支援 `CREATE DATABASE`，執行時會報錯。

正確做法：先在外層查 `pg_database`，確認不存在後直接執行 `CREATE DATABASE`：

    -- shell-level check
    psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='<dbname>'"
    -- if result != "1", then:
    CREATE DATABASE <dbname> OWNER <username>;


## `base` 欄位整合

所選 private config (預設 `config/private/secret.ls`) 的 `base` 欄位決定哪個 frontend/backend 目錄被載入，init 腳本也讀取這個欄位，自動執行 `config/<base>/db/` 下的自定義 SQL。多個 `.sql` 檔依字典序執行。
