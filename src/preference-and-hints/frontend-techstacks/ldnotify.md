# ldnotify

超輕量 toast 通知。固定於畫面上方置中，多則往下堆疊，預設 3 秒自動淡出。

概覽與選用原則見 [index.md](index.md)。同屬 loading.io 家族，相關前端工具見
[../../framework/@loadingio/index.md](../../framework/@loadingio/index.md)。


## 用法

    ldnotify.send('success', '已儲存')

內建型別：`success` / `warning` / `danger` / `light` / `dark`，各有自帶顏色與內嵌 SVG 圖示。
可 `new ldnotify({delay, className, ...})` 自訂。


## 與 bootstrap 的關係

執行期不需 bootstrap。`bootstrap` 只在 devDependencies（demo 與 build 用），dist 產物完全
自包含，所有樣式都是 `ldnotify-*` class，可直接用於任何框架的專案。CSS 中唯一的 `.alert`
規則只有在你主動把 `className` 設成 bootstrap 的 class 時才會用到。


## 接入慣例

 - CDN 載入（發佈時檔案在套件根目錄，不在 `dist/`）：

        https://cdn.jsdelivr.net/npm/ldnotify@0.0.6/index.min.js
        https://cdn.jsdelivr.net/npm/ldnotify@0.0.6/index.min.css

 - 建議包一層捷徑，例如 `notify.ok` / `notify.err` 包住 `ldnotify.send`，呼叫端簡潔且好統一調整。


## 已知限制

 - 顯示時間是 instance 層級（建構時 `delay`），`send` 不支援單次覆寫；要不同時間可另開 instance。
 - toast 預設 `pointer-events: none`，只能自動消失，不能點擊關閉。
