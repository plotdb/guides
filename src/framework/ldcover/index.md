# ldcover

彈出視窗 ( dialog / modal ) 函式庫。核心想法是把一個對話框當成「問一個問題、等一個答案」：
`get()` 打開並回傳 Promise，`set(value)` 關閉並 resolve 它。


## 安裝與引用

    npm install ldcover

    <link rel="stylesheet" href="path-to-ldcover/index.min.css">
    <script src="path-to-ldcover/index.min.js"></script>

DOM 結構固定為三層，樣式依賴這個結構：

    .ldcv            # 全螢幕遮罩
      .base          # 對話框外框，控制寬度
        .inner       # 內容區，transition 動畫作用在這一層


## 取值：get / set / cancel

    cover = new ldcover root: node

    (ret) <- cover.get!then _
    if ret != \yes => return
    # 使用者按下 yes 才會走到這裡

關閉的一方呼叫 `set(value)`；`value` 就是 `get()` 的 resolve 值。
不想用 JS 綁定時，可以直接在 DOM 上宣告：

    .btn(data-ldcv-set="yes") Yes
    .btn(data-ldcv-set="") Cancel

 - `set(v, hide = true)`：resolve 所有等待中的 promise，預設同時關閉
 - `cancel(err, hide = true)`：reject，預設帶 `{name: 'lderror', id: 999}`
   - DOM 上對應 `data-ldcv-cancel`
 - `toggle(state, data)`：純開關，不涉及取值

常見誤區：**ldcover 沒有 `set` 事件**。`cover.on \set, cb` 不會被呼叫 ——
`set()` 只 resolve promise，所以要拿值一定是走 `get()`。


## 傳入資料：data 事件

`get(data)` 與 `toggle(true, data)` 的參數會以 `data` 事件送出，
這是把「外部狀態」交給對話框的正規路徑，對話框因此不需要反向去讀宿主頁面的變數：

    # 宿主
    cover.get {user: someUser, payments: rows}

    # 對話框內部
    cover.on \data, ({user, payments}) ->
      lc.user = user
      load!

用 block 封裝對話框時，這一點特別重要：block 只認得 payload，不認得 host，
搬到別的頁面也不用改。


## DOM 位置與生命週期

三個選項在控制「這個 cover 的 DOM 在哪、什麼時候在」，預設值多數情況下不用動：

 - `resident`：預設 `false`。非常駐 —— init 時 ldcover 會把 root 從 DOM 拔掉，
   在原位留下一個 comment placeholder，開啟時插回 placeholder 前，關閉時再拔掉。
   設 `true` 則 DOM 永遠留在文件裡。
 - `inPlace`：預設 `true`。設為 `false` 時，init 當下就把 root 搬到 `document.body` 底下，
   之後的插入/移除都以那裡為基準。
 - `container`：非常駐 cover 顯示時要插入的容器。不給就用 placeholder 的原位；
   明確給 `null` 則插到 `document.body` 結尾。

要點是：**疊加順序不需要靠這些選項處理**。ldcover 的 `autoZ` / `zmgr` 會自動管理 z-index
( 見下節 )，所以「怕被外層蓋住」不是調 `inPlace` 的理由。

真正需要 `inPlace: false` 的是 **root 被困在某個祖先節點裡**的情況：祖先有
`overflow: hidden`、`transform`、`filter` 等會建立 containing block 的樣式時，
fixed 定位會失效或被裁切，這時必須把 root 拉到 body 底下。

**巢狀對話框就是最常見的一例**：把確認框的 markup 寫在另一個 cover 的 DOM 裡面時，
它會留在那個 dialog 內部，遮罩只蓋得住祖先的範圍 —— 表現出來就是「確認框跳出來了，
但底下的 dialog 沒有被壓暗」。這種寫法一定要加 `inPlace: false` 把它拉出去：

    @confirm = new ldcover root: node, in-place: false, zmgr: core.zmgr


## z-index 管理

 - `autoZ`：預設 `true`。每次開啟時取用比目前所有 cover 更大的 z-index
 - `baseZ`：z-index 下限，預設 `3000`
 - `zmgr`：交由共用的 z-index manager 管理，跨 widget 統一排序
   - 搭配 zmgr 時 `baseZ` 會被當成下界傳給它；需要較小的值時把 `baseZ` 設為 `0`


## 其他常用選項

 - `escape`：按 ESC 是否關閉，預設 `true`
 - `lock`：預設 `false`；設 `true` 後只有 API 或 `data-ldcv-set` 能關閉
 - `type`：附加 class，空白分隔
 - `animation`：開啟時加到 `.inner` 的 class 列表，關閉時移除，
   可搭配 transition.css / animate.css
 - `delay`：預設 300ms，需與 transition 時間一致，影響 `shown` / `running` class
 - `transformFix`：加上 `shown` class 以移除 `.inner` 的 transform，
   解決內容模糊的問題，但可能造成動畫閃爍


## 事件

 - `data`：`get(data)` / `toggle(true, data)` 傳入的資料
 - `toggle.on` / `toggle.off`：開始開啟 / 關閉
 - `toggled.on` / `toggled.off`：動畫結束後
