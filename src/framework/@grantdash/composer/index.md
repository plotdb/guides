# @grantdash/composer

表單設計器，作為 `@makeform/*` blocks 的 host 環境。負責 sharedb 連線、資料同步、block 生命週期管理。

原始碼：`grantdash/projects/composer/`


## Host Interface（hitf）

Composer 對所有 hosted block 暴露的 API，在 block attach 時設定在 block instance 的 `@hitf`：

    hitf!totext(label)     # richtext/i18n 物件 → 純文字字串
    hitf!wrap(obj)         # 包裝成 richtext 格式（lngctx: {lang: ops}）
    hitf!edit(opt)         # 開啟 richtext 編輯器（ldview action handler 格式）
    hitf!render(opt)       # 渲染 richtext 到 DOM（ldview handler 格式）
    hitf!get!              # 取得 widget 目前的 config 資料
    hitf!set!              # 觸發 config 變動儲存


## 資料同步（datahub）

Composer 用 `@plotdb/datahub` 管理 sharedb 資料同步：

 - 主 hub（`@hub!`）接 sharedb document
 - 各子模組（metainfo、condition 等）建立 scoped hub，pipe 到主 hub
 - Block 直接呼叫 `hub.ops-out([op])`，資料自動同步，不需 confirm 步驟


## Block 路徑慣例

Composer 內的 block 放在 `src/block/` 下，BID 格式：
`@grantdash/composer:block/<name>`
