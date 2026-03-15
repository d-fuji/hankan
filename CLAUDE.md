# 藩鑑 (Hankan) - Project Instructions

江戸時代の藩・藩主・石高を横断的に検索・閲覧するデータベースWebアプリ。

## 技術スタック

- **Framework**: Next.js 16 (App Router, TypeScript strict)
- **UI**: Tailwind CSS v4 + shadcn/ui v4, Noto Serif JP / Noto Sans JP
- **DB**: PostgreSQL 17 (Docker local / Neon prod), Prisma 7 ORM
- **Test**: Vitest + Testing Library + MSW
- **Lint**: ESLint 9 (flat config) + Prettier

## 開発方針

### TDD (テスト駆動開発)

1. **Red**: 失敗するテストを先に書く
2. **Green**: テストを通す最小限の実装
3. **Refactor**: リファクタリング（テストが通る状態を維持）

### 開発フロー

```
テスト作成 → 実装 → テスト通過確認 → lint/format → コミット
```

## コマンド

```bash
npm run dev              # 開発サーバー
npm run test             # テスト（watch）
npm run test:run         # テスト（1回実行）
npm run lint             # ESLint
npm run format           # Prettier 修正
npm run format:check     # Prettier チェック
npm run db:generate      # Prisma Client 再生成
npm run db:migrate       # マイグレーション作成・適用
npm run db:seed          # シードデータ投入（upsert、冪等）
npm run db:reset         # DB 初期化
npm run db:prod:migrate  # 本番マイグレーション適用
npm run db:prod:seed     # 本番シードデータ投入
npm run db:prod:status   # 本番マイグレーション状態確認
```

## ディレクトリ構成

```
src/
├── app/                  # ページ + API Routes
│   ├── api/              # API エンドポイント
│   │   ├── clans/        # 家API
│   │   ├── persons/      # 人物API（lineage含む）
│   │   ├── territories/  # 領地API
│   │   └── annual/       # 年代ビューAPI
│   ├── clans/            # 家ページ
│   ├── persons/          # 人物ページ
│   ├── territories/      # 領地ページ
│   ├── shoguns/          # 将軍一覧ページ
│   └── annual/           # 年代ビューページ
├── components/           # UIコンポーネント
│   └── ui/               # shadcn/ui
├── lib/                  # ユーティリティ・マッパー
├── types/                # 型定義
└── generated/            # Prisma Client（gitignore済み）

prisma/
├── schema.prisma
├── seed.ts               # upsertベースのシード
└── seed-data/            # JSONマスタデータ（正のデータソース）
```

## DB設計ルール

- **ID**: `Int @default(autoincrement())` — JOINパフォーマンス重視
- **key**: `String @unique` — upsert用安定キー、プレフィックス付き（例: `province_kaga`）
- シードデータは `prisma/seed-data/*.json` に分離管理
- リレーションはJSON内で `key` 参照（例: `provinceKey: "province_kaga"`）

## Prisma

- Client import: `@/generated/prisma/client`（`@prisma/client` は使わない）
- 本番: `@prisma/adapter-neon`、ローカル: `@prisma/adapter-pg` で自動切替
- `src/generated/prisma/` は `.gitignore` 済み、`prisma generate` で生成

## テスト規則

- テストファイル: `src/**/__tests__/**/*.test.{ts,tsx}`
- API テスト: MSW でモック
- コンポーネントテスト: Testing Library + SWR テストプロバイダー
- マッパー/ユーティリティ: 純粋なユニットテスト

## スタイル

- カラーパレット: navy(`#1B2A4A`), gold(`#C9A96E`), ink(`#333`), cream(`#FAF8F5`)
- フォント: 見出し=Noto Serif JP, 本文=Noto Sans JP
