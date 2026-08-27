# Change Logs

## master

 - lsc-coding-guide: 補「`do` 的縮排區塊沒有結束標記」一節 —— `f do` 後面同一層的
   鏈式呼叫會被吃進最後一個屬性裡(`devices: ['sheet'].then(...)`),**編譯完全成功**、
   執行時才在意想不到的地方報錯;`{ … } .then` 是可行的替代,但 `}` 後面**必須有空白**
   (`}.then` 會把 `.then` 接回物件上,跟 `do` 犯一樣的錯)。判準是「看得出來 `.then`
   接在什麼上面」,選項抽成具名變數最不會出事
 - version-control: 補 `a.c.p` 縮寫說明 —— 即 add + commit + push（`a.c` 則只到 commit）
 - tools: 新增 `src/tools/` —— 記錄工具行為上的陷阱與非顯而易見的限制，
   與教學型的指南分開
 - tools/terminal: 新增終端機控制筆記 —— OSC 標題序列（`\033]0;`）與 iTerm2 專屬的
   分頁顏色序列（`\033]6;1;bg;`，吃全 RGB 而非 ANSI 十六色，且非作用中分頁會被調暗，
   選色要據此判斷）；另記 tty 存取：沒有 controlling terminal 時 `/dev/tty` 開不起來，
   而 `test -w /dev/tty` 會回 true（只檢查權限位元，是假訊號），可靠作法是往上爬
   process tree 找有 tty 的祖先，並注意 `2>/dev/null` 要寫在重導向之前才抑制得了
 - tools/claude-code: 新增 hook / skill / 設定筆記 —— hook 沒有 controlling terminal
   且 stdin 是事件 JSON、`settings.json` 改完要 `/hooks` 重載而腳本改了立即生效、
   跑在熱路徑上的 `PostToolUse` 要加 `async`、「一輪一次」的事件無法涵蓋中途狀態變化；
   skill 目錄不能巢狀（只掃一層）但支援 symlink，名稱來自 frontmatter 且會被消毒；
   環境變數只在啟動時讀取，且一個開關可能關掉整條路徑（關閉標題自動更新會連帶讓
   `/rename` 也改不了標題）

## v0.3.4

 - lsc-coding-guide: 補「雙引號字串裡的 `#name` 是插值」一節 —— `#` 後直接接合法識別字
   也會插值（`#aaa` / `#eee` / `#fff` 會炸成頂層 ReferenceError，`#999`、`#2b6cb0` 這類
   數字開頭則正常，容易誤判成安全），失敗形式是整個模組不執行、畫面全白而 console 可能
   沒訊息；解法是 `\#` 跳脫或改用單引號 / `'''` heredoc
 - lsc-coding-guide: 補單項 `*` list 會塌成物件的陷阱（見 4b4bd79，補記）
 - servebase: 補 `npm run ping` 與多 agent 協作流程（見 3afdaf5，補記）

## v0.3.3

 - ldview: 補「巢狀 ld-each 的 ctx / ctxs」一節 —— `list` 與 item view 的 `ctxs` 差一層
   （`list` 的 `ctx` 是外層那筆、`ctxs.0` 是再外層；item view 的 `ctx` 是本筆、`ctxs.0`
   才是外層）、`key` 收到的是資料項本身、外層資料建議在 `list` 算好塞進項目；
   另補兩個陷阱：`list` 的例外不在 `_render` 的 try/catch 內（會拋穿 `init()`／`render()`
   導致整個 view 初始化中斷），以及 ld-each 定義層級放錯時不會報錯、範本會原封不動留在畫面上

## v0.3.2

 - 新增 `framework/ldcover` 指南：get / set / cancel 的取值模式（`set` 沒有對應事件，
   取值只能 await `get()`）、`data` 事件傳入資料、`resident` / `inPlace` / `container`
   的 DOM 生命週期與判斷準則（疊加由 `autoZ` / `zmgr` 處理，`inPlace: false` 是給
   root 被祖先困住的情況，巢狀 cover 為常見案例）、z-index 管理、常用選項與事件
 - servebase: 更新 stop/restart, 補 log / service / cachestamp（見 76ee429，補記）


## v0.3.1

 - update fedep guide: add "發布組合與安裝端效果" section — npm vs github release vs no-dist publish combinations and their consumer-side effects (`#master` vs `#release` / tag)
 - update @plotdb/block guide:
   - add "Block 檔案格式" section: html-based definition, auto-scoped style with `:scope` for root, shared `this` across init/interface, headless mode
   - fix `parent` description: it is the parent factory object; call `parent.interface!` to get the parent API
   - expand manager notes: registry function, `from()` returns `{instance, interface}` and does not forward data, `create({data, root})` behavior
 - update preference-and-hints folder for frontend-techstacks hint
 - try to add subfolder rules in context-project-guide
 - context-project-guide: generalize subfolder rules — status subfolders (done/hold/drop) and year-based archive apply to all subdirs (logs/, tasks/, ...); order is status first, then year (e.g. tasks/done/2025/0101-foo.md)


## v0.3.0

 - rename src/*.md with numeric prefixes for ordered reference (breaking: 舊檔名引用需更新)：
   - `context-project-guide.md` → `1.context-project-guide.md`
   - `fedev.md` → `2.fedev.md`
   - `version-control.md` → `3.version-control.md`
   - `md-style-guide.md` → `4.md-style-guide.md`
   - `tool-guide.md` → `5.tool-guide.md`
   - `docker-environment.md` → `6.docker-environment.md`
   - `js-coding-guide.md` → `7.js-coding-guide.md`
   - `stylus-style-guide.md` → `8.stylus-style-guide.md`
   - `lsc-coding-guide.md` → `9.lsc-coding-guide.md`


## v0.2.0

 - init -g: use ~/.context/@plotdb/guides instead of npm global root; auto-clone if not found
 - add npm run link to symlink current repo to ~/.context/@plotdb/guides


## v0.1.1

 - add tool-guide.md: node version management, n → volta migration


## v0.1.0

 - rewrite cli.js init: add -g/--global mode, auto-update .gitignore, create context/index.json, fix/repair symlink handling
 - add context/project to repo


## v0.0.5

 - add context-project-guide.md


## v0.0.4

 - add version-control.md
 - consolidate fedep docs from `@plotdb/fedep` to `framework/fedep`
 - follow md-style-guide in fedep and version-control docs


## v0.0.3

 - fix path issue when initing


## v0.0.2

 - use relative instead of absolute path to build symlink from context/shared to `node_modules`


## v0.0.1

 - init release
