# 捲動與指標裝置

捲動看起來是瀏覽器內建行為，但一個元素要不要吃掉捲動、吃掉之後要不要往外傳，
取決於好幾個彼此獨立的機制。它們失敗時都不會報錯，只會表現成「頁面捲不動」，
所以難的不是修，是判斷是誰吃掉的。


## 攔截捲動的三個機制

第一個是 `preventDefault`。非 passive 的 `wheel` listener 呼叫它就會擋掉預設捲動。
這是唯一能從事件物件上直接觀察到的機制，看 `defaultPrevented` 即可。

第二個是原生 overflow。元素若有實際溢出內容，捲動會先餵給它，捲到底才輪到外層。

第三個是 `overscroll-behavior`，也是最容易被忽略的一個。它決定捲動要不要往祖先傳遞，
`contain` 表示不要。關鍵在於它作用的對象是 scroll container ——
而 `overflow: hidden` 的元素也是 scroll container，只是使用者沒辦法用 UI 捲它。
換句話說，一個沒有捲軸、內容也沒溢出、`scrollHeight` 等於 `clientHeight` 的元素，
只要帶著 `overscroll-behavior: contain`，仍然可以攔住捲動不讓頁面拿到，
而且整個過程沒有任何 `preventDefault` 參與，事件看起來完全乾淨。

實務上的後果是：關掉某個元件的 wheel handler，不代表它就放行了。
CSS 那條路徑是獨立的，要一起關。


## 軸向要分開處理

`overscroll-behavior` 常被整條寫成 `contain`，但兩個軸的需求通常不同。

macOS 上兩指左滑觸發的上一頁手勢住在水平軸，所以擋它只需要 `overscroll-behavior-x`。
把垂直軸一起 `contain` 對防手勢毫無幫助，卻會讓元素連帶扣住頁面的垂直捲動。
需要擋手勢又不想妨礙頁面時，寫 `overscroll-behavior-x: contain` 而不是 `contain`。

另外，手勢一旦在頁面任何地方觸發過一次，之後即使在有 `contain` 的容器內也會持續發生。
遇到這種情況，把 `overscroll-behavior: contain` 直接下在 `body` 上比下在容器上有效。


## 滾輪與觸控板不是同一回事

滑鼠滾輪送出的是離散的 tick，每個 tick 各自結算。
觸控板送出的是連續手勢，而 Chrome 有 scroll latching ——
手勢開始時鎖定一個 scroller，整段手勢期間都不換對象。

後果是同一份 CSS 在兩種輸入下可以表現不同：滾輪 tick 可能順利傳給頁面，
但觸控板手勢從元素上起手就被 latch 住，整段被該元素的 `overscroll-behavior` 吃光。
只用滑鼠測過就宣告沒問題是不夠的。


## 查證方式

判斷是不是 `preventDefault` 造成的，派發一個可取消的 `WheelEvent` 看結果：

    const e = new WheelEvent('wheel', {bubbles: true, cancelable: true, deltaY: -120});
    element.dispatchEvent(e);
    console.log(e.defaultPrevented);

判斷是不是 `overscroll-behavior` 造成的，讀 computed style 的兩個軸，
並確認該元素是不是 scroll container ( `overflow` 不是 `visible` 即是 )：

    const cs = getComputedStyle(element);
    console.log(cs.overflow, cs.overscrollBehaviorX, cs.overscrollBehaviorY);
    console.log(element.scrollHeight > element.clientHeight);

要注意的是，觸控板 latching 沒有可靠的程式化重現方式，只能用實體觸控板手動確認。
自動化工具送出的捲動多半也測不到這一層，詳見
[../../tools/claude-code/browser-automation.md](../../tools/claude-code/browser-automation.md)。

本文關於 `overflow: hidden` 仍是 scroll container、以及 latching 的部分屬規格與瀏覽器
既有行為，並非在特定專案中隔離驗證出來的結論；`defaultPrevented` 與 computed style
這兩種查證方式則是實測可用的。
