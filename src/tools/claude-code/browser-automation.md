# 瀏覽器自動化

`mcp__claude-in-chrome__*` 這組工具驅動真實的 Chrome，但它送出的輸入不等同於使用者的輸入。
知道哪些行為測得到、哪些測不到，比測出一個結果更重要 ——
用錯的探針測出來的結果會很有說服力，而且是錯的。


## `computer` 的 `scroll` 動作測不出捲動歸屬

`scroll` 動作看起來是「在座標 (x, y) 捲動」，但它並不等於把 wheel 事件送給該座標下的元素。
實測上它會直接讓頁面捲動，不論該座標下的元素有沒有攔截捲動的設定。

後果是它無法用來測任何跟捲動歸屬有關的問題：元素有沒有吃掉捲動、
`overscroll-behavior` 有沒有生效、scroll chaining 有沒有發生，用它測都會得到「頁面捲動了」。

判斷方式是做對照組：把待測的設定改掉，再跑一次同樣的 `scroll`。
若兩種設定得到相同結果，這個探針對該問題就是無效的，該放棄它而不是拿它的結果下結論。


## 改用可觀察的訊號

跟捲動有關的問題，改成派發事件並讀取事件本身的狀態：

    const e = new WheelEvent('wheel', {bubbles: true, cancelable: true, deltaY: -120});
    element.dispatchEvent(e);
    console.log(e.defaultPrevented);

這測得到 `preventDefault` 那條路徑。CSS 那條路徑改讀 computed style。
兩者的判讀方式見
[../../preference-and-hints/frontend/scrolling.md](../../preference-and-hints/frontend/scrolling.md)。

要注意合成事件不會觸發原生捲動，所以派發之後去看 `window.scrollY` 沒有意義；
能看的是事件物件上的狀態與元素的樣式，不是捲動的結果。


## 測不到的部分

觸控板的連續手勢與 Chrome 的 scroll latching 沒有可靠的程式化重現方式。
牽涉到觸控板行為的問題，用這組工具無法驗證，該說明測不到並請使用者以實體裝置確認，
而不是拿滑鼠滾輪的測試結果代替。

同理，合成的 `mousedown` / `mousemove` / `mouseup` 序列不一定能驅動仰賴真實輸入時序的拖曳；
`computer` 的 `left_click_drag` 走的是真實輸入路徑，兩者失敗時的意義不同 ——
合成事件失敗不代表功能壞掉。


## 版本

以上觀察來自 2026 年 8 月、Chrome extension 版的 `claude-in-chrome` MCP。
工具行為可能改變，但上面的對照組作法在任何版本都適用。
