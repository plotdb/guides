# @plotdb/fedep

前端依賴安裝器。把 `node_modules` 中的套件複製到 `web/static/assets/lib/` 供瀏覽器使用，並建立 `main` symlink 指向版本目錄。

## 指令

```bash
npx fedep          # 依 package.json 安裝所有 frontend deps
npx fedep init     # 互動式產生 frontendDependencies 設定
npx fedep -l "mod:path"  # 使用本地 repo 覆蓋指定模組
```

也可加在 `postinstall`：

```json
"scripts": { "postinstall": "./node_modules/.bin/fedep" }
```

## package.json 設定

```json
"frontendDependencies": {
  "root": "web/static/assets/lib",
  "modules": [
    "ldview",
    { "name": "@loadingio/ldquery" },
    { "name": "bootstrap", "dir": "dist" }
  ]
}
```

## 目錄結構

安裝後：

```
web/static/assets/lib/
  ldview/
    1.7.2/       ← 從 node_modules/ldview 複製
    main -> 1.7.2  ← symlink
```

`+script({name: "ldview"})` → `/assets/lib/ldview/main/index.min.js`

## 模組物件欄位

| 欄位 | 說明 |
|------|------|
| `name` | npm 套件名稱（含 scope，如 `@loadingio/ldquery`） |
| `dir` | 只複製套件內的子目錄（如 `"dir": "dist"`） |
| `link` | `true` 時用 symlink 取代複製，適合本地開發 |
| `optional` | `true` 時找不到不報錯 |
| `browserify` | `true` 或 object，對模組跑 browserify 打包 |

## 本地 symlink 開發流程

當某個套件在本地修改中，用 `-l` 直接指向本地目錄，fedep 會建立 symlink 取代複製：

```bash
npx fedep -l "iconsuite:/path/to/iconsuite"
```

## 重要設計

- `main` symlink 讓 `+script`/`+css` mixin 永遠用 `main/` 引用，不需改版本號
- 本專案的 vectortracer 目前以手動 symlink 方式加入（不在 fedep 管理範圍）：  
  `web/static/assets/lib/vectortracer/main` → `vectortracer/`（專案根目錄）
