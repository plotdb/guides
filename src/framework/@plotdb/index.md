# @plotdb 模組索引

 - `@plotdb/block`：前端 block 模組系統：動態載入、依賴注入、BID 識別、manager。文件：[block/index.md](block/index.md)
 - `@plotdb/datahub`：OT-based pub/sub 資料同步 hub，支援 scoped hub 與 sharedb。文件：[datahub/index.md](datahub/index.md)
 - `@plotdb/form`：表單驗證框架：widget、opset、op、term、valdef、valspec。文件：[form/index.md](form/index.md)
 - `@plotdb/lotion`：確定性動畫工具：動畫是時間的純函數 `seek(t)`，可播放、拖曳、嵌入，也能用 cli 逐格輸出 png / mp4；適合操作教學與解說動畫。文件：[lotion/index.md](lotion/index.md)
 - `@plotdb/lotitor`：lotion 動畫的製作工具：形式與風格指南、風格庫、需人核准的素材生成、音訊產生器。文件：[lotitor/index.md](lotitor/index.md)
 - `@plotdb/konfig`：依 config schema 自動生成 UI，支援動態 meta 更新。文件：[konfig/index.md](konfig/index.md)
 - `@plotdb/srcbuild`：前端 build server：監聽 src/ 編譯 pug/ls/stylus，提供 `+script`/`+css` mixin，可選的內容 hash 快取策略。文件：[srcbuild/index.md](srcbuild/index.md)
 - `fedep`：前端依賴安裝器：從 node_modules 複製套件到 web/static/assets/lib，建立 main symlink；支援 npm 及 GitHub release 發布。文件：[../fedep/index.md](../fedep/index.md)
