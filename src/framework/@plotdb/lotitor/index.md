# @plotdb/lotitor

`@plotdb/lotion` 動畫的製作工具。lotion 負責播放與輸出，lotitor 負責「怎麼做好」：

 - `prompt/`：特定形式與風格的做法。`explainer.md` ( 解說動畫 )、`ui-loop.md` ( 短循環 UI 動態 )、
   `style.md` ( 選風格、照規格做、素材計畫與核准、技巧回饋 )。
 - `resources/style/`：風格庫，110 個風格，各有色票、字體、動態語彙、style prompt 與同一解說場景的參考圖。
   選風格先看 `resources/style/sheet/index.md` ( 依家族的文字索引 ) 與各家族的總覽圖。
 - `tool/asset-gen.ls`：依素材計畫生成點陣素材。計畫須經人核准 ( `approved` )，生成次數受 `budget` 限制。
 - `lotitor bgm | sfx | mix | beats`：音訊產生器，配合頁面的 `cues()` 合成對齊畫面的音樂與音效。
 - `resources/trial/`：完整範例 ( 水墨風格的焚風解說動畫與其純程式對照版 )。

目前是 private repo ( `github.com/plotdb/lotitor` )，以 repo 形式使用，不發布 npm；本機常見位置是與 lotion 同層的
`lotitor/`。讀不到時，以 lotion 的 `prompt/lotion.md` 與 [../lotion/index.md](../lotion/index.md) 為準，
風格、素材與配樂則自行決定，原則是先講定規格 ( 色票、字體、動態語彙 ) 再動手，避免落回預設風格。


## 何時用

 - 只是要在頁面上放一段動畫、或照既有設計實作：lotion 就夠。
 - 要決定動畫的樣子 ( 風格、素材、配樂 )，或做解說片、UI loop 這類有固定做法的形式：先讀 lotitor 的 `prompt/`。
