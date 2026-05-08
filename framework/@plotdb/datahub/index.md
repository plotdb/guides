# @plotdb/datahub

OT（Operational Transformation）based pub/sub 資料同步 hub。設計讓多個模組共享同一份資料並自動同步，通常搭配 sharedb 使用。

## 核心 API

```ls
hub = new datahub
hub.get!            # 取得目前資料快照
hub.ops-out([op])   # 發送 json0 op（資料有變動時呼叫）
src.pipe(hub)       # 將上游資料源接入 hub
```

## Scoped Hub

子模組只操作資料樹的某個子節點：

```ls
scoped = new datahub scope: [\some, \path]
scoped.pipe parent-hub   # ops 會自動在 path 前加 prefix 後傳給 parent
```

## 典型用法（Composer 中）

```ls
# composer 建立 scoped hub 傳給子 block
hub = new datahub scope: [\conditions]
hub.pipe @hub!   # @hub! = composer 的主 hub（接 sharedb）

# block 內對每次資料變動直接 ops-out，不需等 confirm
hub.ops-out json0.diff(hub.get!, new-data)
```

## 設計說明

- `ops-out` 接受 json0 格式的 op 陣列
- Scoped hub 自動在 op path 前加 scope prefix，讓子模組只看到自己的資料切片
- `pipe` chain 讓資料變動自動往上游同步到 sharedb，無需手動觸發儲存
