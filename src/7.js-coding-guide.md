# JS Coding Guide

這裡描述一般性的 JS 規範。此處的規則若適合，則亦適用於撰寫 LiveScript 時。

 - 縮排使用兩個空白.
 - 大括號寫法, 開頭避免獨立一行. 例如:

    if(window.blah) {
      /* ... do something */
    } else {
    }

 - 避免使用 await / async. 優先以 Promise 形式替換.
