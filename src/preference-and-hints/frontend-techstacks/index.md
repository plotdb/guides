# 前端常用元件

蓋網站常用的 UI 元件：需要使用者回應的對話框，以及不需回應、短暫顯示的通知。
皆為 vanilla JS、`window` 全域、不綁框架、可用 CDN 載入。細節見各自文件。

 - `ldcover`：cover / 對話框。3.6.0 起內建 promise 版 `alert` / `confirm` / `prompt` / `dialog`，採主題制。詳見 [ldcover.md](ldcover.md)
 - `ldnotify`：toast 通知，`ldnotify.send(type, msg)`，自帶樣式。詳見 [ldnotify.md](ldnotify.md)

兩者同屬 loading.io 前端工具家族；相關工具 ( `ldquery`、`debounce.js` 等 ) 見
[../../framework/@loadingio/index.md](../../framework/@loadingio/index.md)。

選用原則：需要使用者做決定 ( 確認 / 輸入 )，或一次性且必須被看到的內容 ( 如只顯示一次的
暫時密碼 )，用 `ldcover`；純成功 / 提示回饋用 `ldnotify` toast。失敗訊息用哪一種屬專案取捨，
宜全站統一。
