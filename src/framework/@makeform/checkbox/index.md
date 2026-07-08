# @makeform/checkbox

多選 checkbox widget block。

原始碼：`makeform/blocks/checkbox/src/index.ls`


## 特性

 - `valdef`: `"@plotdb/form:valdef/choice"`
 - `valspec`: 同 radio，label 已透過 `hitf!totext` 轉換
 - Other 選項：用 `{other: {enabled, text}}` 格式


## Value 格式（`content()` 回傳）

`content()` 依 list items 格式回傳不同型別（backward compat）：

 - Items 全是 string（舊格式）→ 回傳 flat array `[...keys, other_text?]`
 - Items 有 `key` 或 `label` 的物件（新格式）→ 回傳 `{list: [keys], other: {enabled, text}}`，可直接餵給 choice opset


## valspec

    @mod.valspec = ~>
      values: lc.values.map (v) ->
        key: v.key or v, value: v.value or v, label: hitf!totext(v.label or v.value or v.key or v)
