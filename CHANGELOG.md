# Change Logs

## v0.3.9

 - context-project-guide: 新增 `initiative/` —— 放構想、草案與尚未定案的討論。
   它與其它子目錄的差別在於程式碼還不存在時, 草案暫時就是 source of truth,
   而 `ref/` 收的是被動供查閱的素材。關鍵規則是落地後即凍結, 內容不再更新只改狀態 ——
   有了這條它就與 `logs/` 同性質, 宣稱的是「某天我們打算這樣做」這個時點而非現況,
   程式再怎麼改都不會讓它變假; 少了這條它會退化成另一份必然過期的 spec。
   `initiative/drop/` 特別值得留, 「考慮過 X 但否決了」是原始碼編碼不了的資訊,
   而它通常大到塞不進註解。四個子目錄合起來是一條承諾程度的軸:
   initiative ( 還在想 ) 到 tasks ( 決定做 ) 到 logs ( 做了什麼 ) 到 ref ( 素材 )
 - context-project-guide: `spec.md` 與 `features.md` 移到結構清單末尾並標記 TBR ——
   疑慮是這兩份宣稱的是「系統現在長怎樣」, 而這句話的真偽隨每次 commit 改變,
   因此需要跟著每次改動維護, 但實務上不會, 改程式的人沒有動機去更新一份與執行無關的
   檔案, 而過期卻看起來仍具權威的文件比沒有文件更糟。判準是「這份文件與程式碼不一致時
   會去改哪一邊」, 答案是改文件的就是衍生物。另記錄源碼編碼不了的三類資訊 ( 被否決的
   選項、失敗的嘗試、外部事實 ) 傾向寫在決策發生的那一行旁邊, 因為註解與它解釋的對象
   住在一起, 改那段程式一定會看到、刪那段程式時一起被刪

 - lsc-coding-guide: 新增「位元運算要寫成 `.>>.` / `.&.` 這種前後加點的形式」——
   六個位元運算子只有 `>>>` 與 `|` 會當場 parse error, `>>` / `<<` 變成函式合成、
   `&` 變成把左運算元當函式呼叫、`^` 變成 `Math.pow`, 四個都編譯得過而要到執行期才炸。
   `^` 最陰險, 對數字完全合法不拋錯, 只是算出完全不同的值。一元 `~` 與 JS 相同不用加點
 - lsc-coding-guide: 新增「隱式呼叫會貪婪地吃掉整個後續運算式」—— 不加括號的呼叫,
   參數會一路吃到運算式結尾, 連比較運算子與逗號後的其他參數都吃 ( `Math.max Math.abs p - a, 0`
   會把 `0` 餵給 `abs` )。另註明括號前有空白等於沒括號: `Math.sqrt (a) * b` 仍是
   `Math.sqrt(a * b)`, 括號要緊貼函式名
 - lsc-coding-guide: 新增「後置 `if` 會綁進最近的函式, 不是綁在 `return` 上」——
   `return arr.map (v) -> ... if cond` 的條件會鑽進 callback 內部, 變成無條件執行
   且回傳一堆 null
 - lsc-coding-guide: 新增「destructuring 參數裡不能放字串 key」, `({a, "b-c"}) ->`
   是 invalid assign 的編譯錯誤, 與物件定義端可用引號 key 不對稱
 - lsc-coding-guide: 「物件 key 含有連字號」補上定義端與存取端必須一致 ——
   無引號的 `ab-weight:` 會編譯成 `abWeight`, 用 `obj["ab-weight"]` 讀到 undefined,
   而失敗形式是往下游擴散成 NaN, NaN 的比較永遠是 false, 統計值顯示 0 看起來一切正常


## v0.3.8

 - version-control: 新增「Tag 命名」—— fedep 1.8.0 起 `publish -g` 會打兩個 tag,
   `dist/vX.Y.Z` 指 release branch 上的產物, `src/vX.Y.Z` 指產生它的 source commit。
   兩側都加前綴而不是只加新的那個: 若只有 source 加 `src/`、release 維持裸名, 同一個
   repo 裡就會有 `v1.2.3` 是產物、`v1.2.4` 是原始碼, 名字本身分不出來。裸 `vX.Y.Z`
   的解讀方式也一併寫明, 判準是這個 repo 有沒有 release branch —— 有的話該 tag 是
   1.8.0 以前留下的、指向產物; 沒有的話這個 repo 只有一側, 裸名就是對的名字 ( 只上
   npm 的模組, 或把產物直接 commit 進 source branch 的模組 )。因此 `fedep publish`
   走 npm 那條路徑不打 tag
 - version-control: 方式 A 補上完整流程與適用情境 —— 它是無 release branch 專用的
   裸 tag 路徑。release notes 改成把 CHANGELOG section 接給 `gh`, 不要在網頁 UI 上貼:
   網頁表單送出的內容會帶 `\r\n` 換行。另註明 npm 與 GitHub 兩半要一起做完, 只做一半
   沒有任何提示 —— fedep 自己就有七個版本上了 npm 卻沒有 tag 與 release
 - version-control: 查最後一次 tag 的指令要指定查哪一側, 否則前綴會混進 `-v:refname`
   的排序
 - fedep: 發布流程補上第 8 步 ( 打 `src/` tag ), 安裝端說明改用 `#dist/vX.Y.Z`,
   並註明 committish 含斜線不影響 npm 解析


## v0.3.7

 - context-project-guide: `ref/` 的命名要求分成兩種位置 —— `yyyymmdd-` 前綴真正發揮
   作用的是根層 `context/project/ref/` ( 沒有 scope、什麼都收、只會愈長愈大, 靠檔名的
   日期讓目錄列表自己成為索引 ); 主題資料夾下的 ref ( 如 `features/credit/ref/` ) 已經
   被父層 scope 限縮, 路徑本身就回答了「這是關於什麼的」, 命名可以寬鬆。同一主題累積
   出第二批時再用 `yyyymmdd-<intent>/` 分批, 只有一批時不必先分


## v0.3.6

 - context-project-guide: 新增 `ref/` —— 討論串、腦力激盪、外部建議、被取代的舊 spec,
   `logs/` 與 `tasks/` 兩邊都不是, 之前沒有地方放。判準是有沒有時間軸:log 記「某天做了
   什麼」有前後順序, 用狀態與年份分類; ref 沒有這條軸, 屬於它所描述的主題。因此不要在
   `logs/` 底下開 `brainstorm/` 或 `draft/` —— 那會讓狀態 ( todo/done/hold/drop ) 與種類
   混在同一層, 看到 `logs/brainstorm/foo.md` 答不出它做完了沒。命名預設
   `yyyymmdd-<name>.md`, 因為 ref 是只會愈長愈大的堆, 手工維護的目錄清單一定會過期,
   而過期的清單比沒有清單更糟; 檔名帶日期則讓目錄列表自己就是索引。逐檔唯一要做的是
   在開頭註明已失效與現行權威在哪

 - preference-and-hints: `frontend-techstacks/` 移入 `frontend/techstacks/`，與同層的
   `frontend/scrolling.md` 對齊 —— 前端相關的筆記收在同一個分類底下，不再有兩種命名並存
 - preference-and-hints: 補 `index.md` —— `framework/` 與 `tools/` 都有分類入口，
   這裡原本沒有；順帶寫下與那兩者的分界 ( `framework/` 記套件怎麼用、這裡記何時該用，
   `tools/` 記開發用的外部工具、這裡記寫進產品裡的東西 )


## v0.3.5

 - preference-and-hints/frontend: 新增前端平台陷阱分類，與談元件選用的 `frontend-techstacks/`
   分開 —— 這邊記平台本身怎麼運作
 - preference-and-hints/frontend/scrolling: 新增捲動與指標裝置筆記 —— 攔截捲動有三個互相
   獨立的機制 ( `preventDefault`、原生 overflow、`overscroll-behavior` )，其中最容易漏掉的是
   `overscroll-behavior`：它作用於 scroll container，而 `overflow: hidden` 的元素也算，
   所以一個沒有捲軸、內容也沒溢出的元素仍可攔住捲動不讓頁面拿到，且過程中沒有任何
   `preventDefault` 參與；另記 swipe-back 只住在水平軸 ( 用 `overscroll-behavior-x` 就夠，
   整條 `contain` 會連帶扣住頁面的垂直捲動 )，以及滾輪 tick 與觸控板手勢因 scroll latching
   而表現可能不同，只用滑鼠測過不足以宣告沒問題
 - tools/claude-code/browser-automation: 新增瀏覽器自動化筆記 —— `computer` 的 `scroll`
   動作會直接讓頁面捲動，不論座標下的元素有沒有攔截設定，因此測不出任何跟捲動歸屬有關的
   問題；判斷探針是否有效的方法是做對照組 ( 改掉待測設定再跑一次，結果相同即為無效探針 )；
   合成事件不觸發原生捲動，所以能看的是 `defaultPrevented` 與 computed style 而非
   `window.scrollY`；觸控板 latching 則無法程式化重現，應說明測不到而非拿滾輪結果代替

 - lsc-coding-guide: 補「`do` 的縮排區塊沒有結束標記」一節 —— `f do` 後面同一層的
   鏈式呼叫會被吃進最後一個屬性裡 ( `devices: ['sheet'].then(...)` )，**編譯完全成功**、
   執行時才在意想不到的地方報錯；`{ … } .then` 是可行的替代，但 `}` 後面**必須有空白**
   ( `}.then` 會把 `.then` 接回物件上，跟 `do` 犯一樣的錯 )；判準是「看得出來 `.then`
   接在什麼上面」，選項抽成具名變數最不會出事
 - version-control: 補 `a.c.p` 縮寫說明 —— 即 add + commit + push ( `a.c` 則只到 commit )
 - tools: 新增 `src/tools/` —— 記錄工具行為上的陷阱與非顯而易見的限制，
   與教學型的指南分開
 - tools/terminal: 新增終端機控制筆記 —— OSC 標題序列 ( `\033]0;` ) 與 iTerm2 專屬的
   分頁顏色序列 ( `\033]6;1;bg;`，吃全 RGB 而非 ANSI 十六色，且非作用中分頁會被調暗，
   選色要據此判斷 )；另記 tty 存取：沒有 controlling terminal 時 `/dev/tty` 開不起來，
   而 `test -w /dev/tty` 會回 true ( 只檢查權限位元，是假訊號 )，可靠作法是往上爬
   process tree 找有 tty 的祖先，並注意 `2>/dev/null` 要寫在重導向之前才抑制得了
 - tools/claude-code: 新增 hook / skill / 設定筆記 —— hook 沒有 controlling terminal
   且 stdin 是事件 JSON、`settings.json` 改完要 `/hooks` 重載而腳本改了立即生效、
   跑在熱路徑上的 `PostToolUse` 要加 `async`、「一輪一次」的事件無法涵蓋中途狀態變化；
   skill 目錄不能巢狀 ( 只掃一層 ) 但支援 symlink，名稱來自 frontmatter 且會被消毒；
   環境變數只在啟動時讀取，且一個開關可能關掉整條路徑 ( 關閉標題自動更新會連帶讓
   `/rename` 也改不了標題 )

## v0.3.4

 - lsc-coding-guide: 補「雙引號字串裡的 `#name` 是插值」一節 —— `#` 後直接接合法識別字
   也會插值 ( `#aaa` / `#eee` / `#fff` 會炸成頂層 ReferenceError，`#999`、`#2b6cb0` 這類
   數字開頭則正常，容易誤判成安全 )，失敗形式是整個模組不執行、畫面全白而 console 可能
   沒訊息；解法是 `\#` 跳脫或改用單引號 / `'''` heredoc
 - lsc-coding-guide: 補單項 `*` list 會塌成物件的陷阱 ( 見 4b4bd79，補記 )
 - servebase: 補 `npm run ping` 與多 agent 協作流程 ( 見 3afdaf5，補記 )

## v0.3.3

 - ldview: 補「巢狀 ld-each 的 ctx / ctxs」一節 —— `list` 與 item view 的 `ctxs` 差一層
   ( `list` 的 `ctx` 是外層那筆、`ctxs.0` 是再外層；item view 的 `ctx` 是本筆、`ctxs.0`
   才是外層 )、`key` 收到的是資料項本身、外層資料建議在 `list` 算好塞進項目；
   另補兩個陷阱：`list` 的例外不在 `_render` 的 try/catch 內 ( 會拋穿 `init()`／`render()`
   導致整個 view 初始化中斷 )，以及 ld-each 定義層級放錯時不會報錯、範本會原封不動留在畫面上

## v0.3.2

 - 新增 `framework/ldcover` 指南：get / set / cancel 的取值模式 ( `set` 沒有對應事件，
   取值只能 await `get()` )、`data` 事件傳入資料、`resident` / `inPlace` / `container`
   的 DOM 生命週期與判斷準則 ( 疊加由 `autoZ` / `zmgr` 處理，`inPlace: false` 是給
   root 被祖先困住的情況，巢狀 cover 為常見案例 )、z-index 管理、常用選項與事件
 - servebase: 更新 stop/restart, 補 log / service / cachestamp ( 見 76ee429，補記 )


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
