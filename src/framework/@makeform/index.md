# @makeform 模組索引

基於 `@plotdb/block` 的表單 widget block 集合，host 為 `@grantdash/composer`。

 - `@makeform/common`：所有 widget 共用的基礎 block；含 term 編輯器（驗證條件 UI）。文件：[common/index.md](common/index.md)
 - `@makeform/radio`：單選 widget。文件：[radio/index.md](radio/index.md)
 - `@makeform/checkbox`：多選 checkbox widget。文件：[checkbox/index.md](checkbox/index.md)
 - `@makeform/choice`：下拉/選項 widget（支援多選、搜尋、其它選項）。文件：[choice/index.md](choice/index.md)


## 共同模式

所有 choice 類 widget（radio、checkbox、choice）：
 - 繼承 `@makeform/common`
 - 宣告 `@mod.valdef = "@plotdb/form:valdef/choice"`
 - 實作 `@mod.valspec` 回傳 `{values: [{key, label, value}]}`，label 已透過 `hitf!totext` 轉為純文字

    @mod.valspec = ~>
      values: lc.values.map (v) ->
        key: v.key or v, value: v.value or v, label: hitf!totext(v.label or v.value or v.key or v)
