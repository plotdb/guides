# @makeform/radio

單選 widget block。

原始碼：`makeform/blocks/radio/src/index.ls`

## 特性

- `valdef`: `"@plotdb/form:valdef/choice"`
- `valspec`: 回傳 `{values: [{key, label, value}]}`，label 已 `hitf!totext` 轉為純文字
- Value 格式：純字串（選中的 key）
- Other 選項：value 存為 plain string（非 `{other: {enabled}}`），是已知限制

## valspec

```ls
@mod.valspec = ~>
  values: lc.values.map (v) ->
    key: v.key or v, value: v.value or v, label: hitf!totext(v.label or v.value or v.key or v)
```

## 注意

Radio 的 "other" 值直接存為 plain string，與 checkbox/choice 的 `{other: {enabled, text}}` 格式不同，`choice opset` 的 `other-checked` op 目前不支援 radio 的 other。
