# @makeform/choice

下拉選單 / 選項 widget block，支援多選、搜尋、其它選項。

原始碼：`makeform/blocks/choice/src/index.ls`


## 特性

 - `valdef`: `"@plotdb/form:valdef/choice"`
 - `valspec`: label 已透過 `hitf!totext` 轉換
 - Value 格式：`{list: [keys], other: {text}}`
 - Other 選項：`__other__` in list 標記已勾選，`other.text` 為自填值


## valspec

    @mod.valspec = ~>
      values: (lc.cfg?values or []).map (v) ->
        key: v.key or v, value: v.value or v, label: hitf!totext(v.label or v.value or v.key or v)


## 注意

Choice 的 value 格式與 checkbox 相同 ( `{list, other}` )，`choice opset` 的 convert() 可正確處理。
