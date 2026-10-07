# @plotdb/lotion

確定性 ( deterministic ) 動畫工具：把動畫寫成時間的純函數 `seek(t)`，同一份程式可以播放、拖曳、
跳段、嵌進網頁，也能逐格輸出成 png 或 mp4。適合做操作教學、概念解說這類「一步一步講清楚」的動畫。

套件內容：

 - runtime：彈簧、關鍵影格 ( `track` )、淡入淡出窗 ( `vis` )、打字效果等小工具，加上有時間軸、
   章節、全螢幕的播放器 ( `lotion.player` )。
 - block player：把動畫包成 `@plotdb/block`，嵌進任何網站。
 - cli ( `lotion` )：逐格輸出 png、contact sheet、mp4，匯出音效時間點 ( `cues` )，以及打包 block。
 - `prompt/lotion.md`：寫 lotion 動畫的基本做法與常見錯誤，動手前值得先讀。

寫、播放、輸出動畫只需要 lotion。製作輔助 ( 解說片、UI loop 等形式的做法、風格庫、素材生成、
音訊產生器 ) 另外放在 `@plotdb/lotitor`，目前是 private repo，見 [../lotitor/index.md](../lotitor/index.md)。
沒有權限時不影響使用 lotion；音效可用任何工具製作，再依 `lotion cues` 匯出的時間點對齊。

原始碼與完整 API：`github.com/plotdb/lotion` 的 README。


## 安裝

    npm install --save @plotdb/lotion

用 fedep 複製到前端時，模組直接寫名稱即可。npm 發布版的 dist 已攤平在套件根目錄
( `fedep publish` 的行為 )，所以路徑是 `index.min.js`，不是 `dist/index.min.js`：

    "frontendDependencies": {
      "modules": [ "@plotdb/lotion" ]
    }

    +css([{name: "@plotdb/lotion", path: "index.min.css"}])
    +script([{name: "@plotdb/lotion", path: "index.min.js"}])


## 基本寫法

    do ->
      {track, vis, bump, put, mk, txt, typing} = lotion
      p = new lotion.player do
        root: '#demo'
        duration: 20
        chapters: [[0, '開始'], [5, '步驟 1']]
        start: 3          # 一開始停在有內容的畫面
        seek: (t) -> seek t
      el = (cls, html = '') -> mk "a #cls", html, p.stage   # .a 設 position: absolute; left: 0; top: 0
      dot = el \dot
      x = track [[0, 100], [5, 800, \move]]
      seek = (t) -> put dot, x(t), 300, 1, vis(t, 0.2)
      Promise.resolve(document.fonts.ready).then -> p.start!

 - 舞台是固定的設計尺寸 ( 預設 1920×1080 )，依容器等比縮放。元素位置一律用舞台座標。
 - `put(el, x, y, scale, opacity, {blur})` 設定 transform 與透明度，透明度為 0 時自動以 visibility 隱藏。
 - `vis(t, t0, t1, din, dout)` 是 0 → 1 → 0 的淡入淡出窗；`bump(t, t0, d)` 是一次脈衝，常用來做點擊回饋。
 - `typing(t, t0, text, dt)` 回傳到時間 `t` 為止打出的字。要在固定秒數內打完，`dt` 用 `秒數 / 字數`。
   結果放進 innerHTML 前記得跳脫 `<`、`>`。
 - `start()` 之前播放器只顯示載入畫面。字型、量測版面這類非同步準備，要在 `start()` 之前完成。


## 檢查畫面：`lotion sheet`

寫完先輸出幾個時間點的畫面，排成一張總覽圖檢查版面，比在瀏覽器裡拖時間軸快：

    lotion sheet http://localhost:3456/page.html out.png 2.8 7.5 11 18 --cols 3 --tile 640

cli 需要 `playwright` ( 含 chromium ) 和 `ffmpeg`。專案裡沒有裝 playwright 時，可以直接用已經裝好的
lotion repo 執行：`node <lotion repo>/dist/cli.js sheet ...`。

每一章的頭、尾、交界，以及每個轉場的中間點都要抽查。只看靜止畫面，會漏掉轉場中的問題。


## 眉角與常見陷阱


### `track` 的關鍵點時間是「開始移動」，不是「抵達」

`track [[t, value, preset], ...]` 的每個關鍵點，是在時間 `t` 把目標換成 `value`，彈簧從那一刻才開始移動，
`move` 這類較慢的 preset 大約 0.8 秒後才到位。所以「在 t1 抵達某處、接著淡出」要寫成在 `t1 - 0.8` 起飛：

    # 錯：t + 2.5 才起飛，但 t + 2.4 就淡出了，畫面上看不到飛行
    x = track [[0, A], [t + 2.0, A], [t + 2.5, B, \move]]
    o = 1 - vis(t, t + 2.4)

    # 對：t + 1.6 起飛，約 t + 2.4 到位，再淡出
    x = track [[0, A], [t + 1.6, B, \move]]
    o = 1 - vis(t, t + 2.5)

也因此不需要「在 t 停在 A」的重複關鍵點；目標沒變就不必寫。


### 元素平鋪在舞台上

子元素設 `visibility: visible` 會蓋過父元素的 `hidden`。最簡單的做法是所有會動的元素都直接放在舞台下、
用舞台座標定位；視窗、卡片這類背景只是一個獨立元素，裡面的內容不要當它的子元素。
真的要巢狀時，子元素的 `put` 要帶 `{hide: false}`。


### 一個東西一路變化，比換一個新的好懂

例如教學中的 token：短效 → 長效 → Page Token → 飛進 `.env`，用同一個元素改文字、顏色、位置，
讀者會自然理解「這是同一個東西變了」。淡出再出現一個新元素，讀者得自己猜兩者的關係。


### LiveScript 保留字

`of`、`on`、`to`、`by` 是保留字，不能當變數名 ( 例如 `of = vis(...)` 會在下一行報 `Unexpected 'ASSIGN'` )。
小數要寫 `0.5`，不能寫 `.5`。字串內插 `"#k：..."` 這類後面緊接中文的寫法會被當成變數名的一部分，要寫 `"#{k}：..."`。
