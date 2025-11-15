# Markdown 文件格式指南

定義撰寫技術文件時應遵循的 Markdown 格式規範。


## 標題與段落間距

### 標題間距

- 標題與內文間至少一個空白行
- 段落結束前（新標題開始前）至少兩個空白行

範例格式：

    # 主標題

    內容開始，標題下方有一個空白行。

    段落結束內容。


    ## 新段落

    新段落內容，前方有兩個空白行。


## Code Block 規範

### 優先使用四個空白

- Markdown 中的 code block 盡量使用四個空白表現
- Code block 前後至少都要有一個空白行
- 只在需要語法高亮時使用三個反引號格式

範例：

    前面的內容。

        const example = {
          root: element,
          enabled: true
        };

    後面的內容。

### 語法高亮的情況

使用三個反引號：

```javascript
// 需要語法高亮的複雜程式碼
function complexFunction() {
  return 'highlighted code';
}
```

### 應用原則

- 簡單程式碼：使用四個空白
- 需要高亮：使用 ```language 格式  
- 前後空白：確保 code block 前後都有空白行
