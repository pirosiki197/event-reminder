# イベントリマインドBot - フロントエンド

## セットアップ

### インストール

```bash
cd frontend
bun install
```

### 開発サーバーの起動

```bash
bun run dev
```

ブラウザで http://localhost:5173/ を開いてください。

### ビルド

```bash
bun run build
```

### プレビュー（本番ビルドの確認）

```bash
bun run preview
```

## 機能

### 1. ダッシュボード（トップページ）

- イベントテンプレートの一覧表示
- テンプレートの検索機能
- 新しいテンプレートの作成

### 2. イベント一覧ページ

- テンプレートごとのイベント表示
- 開催予定/開催済みのフィルタリング
- 新しいイベントの登録
- テンプレート編集への導線

### 3. イベント登録・編集フォーム

- イベント名の入力
- テンプレート選択
- カレンダーUIによる開催日選択
- Slackチャンネルのプルダウン選択
- メンション先の設定

### 4. テンプレート編集ページ

- テンプレート名の変更
- タスクテンプレートの追加・編集・削除
- タスク詳細の管理（タスク名、リマインド日数、説明）

## モックAPI

現在、`src/api/mock.ts`にモックAPIが実装されています。実際のバックエンドAPIが完成したら、以下の手順で切り替えてください:

### バックエンドAPIへの切り替え方法

1. `src/api/`ディレクトリに新しいファイル（例: `backend.ts`）を作成
2. 実際のAPIエンドポイントを呼び出す関数を実装
3. `src/store/index.ts`のimport文を変更:

```typescript
// 変更前
import { eventTemplateApi, taskTemplateApi, eventApi, slackApi } from '../api/mock';

// 変更後
import { eventTemplateApi, taskTemplateApi, eventApi, slackApi } from '../api/backend';
```

### API インターフェース

モックAPIは以下のインターフェースを提供しています:

```typescript
// イベントテンプレートAPI
eventTemplateApi.getAll()
eventTemplateApi.search(query)
eventTemplateApi.getById(templateId)
eventTemplateApi.create(name)
eventTemplateApi.update(templateId, name)
eventTemplateApi.delete(templateId)

// タスクテンプレートAPI
taskTemplateApi.getByTemplateId(templateId)
taskTemplateApi.create(task)
taskTemplateApi.update(taskId, updates)
taskTemplateApi.delete(taskId)

// イベントAPI
eventApi.getAll()
eventApi.getByTemplateId(templateId)
eventApi.getById(eventId)
eventApi.create(event)
eventApi.update(eventId, updates)
eventApi.delete(eventId)

// SlackAPI
slackApi.getChannels()
```

実際のバックエンド実装時は、これらのインターフェースを維持することで、フロントエンドコードの変更を最小限に抑えられます。

## 今後の改善案

- [ ] イベントの検索・フィルタリング機能
- [ ] タスクのドラッグ&ドロップによる並び替え
- [ ] 通知プレビュー機能
- [ ] エクスポート/インポート機能
- [ ] ダークモード対応
