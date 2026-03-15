# 藩鑑（はんかん / Hankan）

江戸時代の藩・藩主・石高を横断的に検索・閲覧するデータベースWebアプリ。

## 主な機能

- **領地検索** — 名前・地域・旧国・石高範囲で領地（藩・天領・旗本領）を検索
- **領地詳細** — 石高推移グラフ、歴代藩主/代官一覧、現代地名
- **人物詳細** — 役職履歴、親子関係、血統ツリー表示
- **血統トラッキング** — 親子関係をツリー形式で可視化、養子関係を区別
- **家一覧・詳細** — 武家の一覧、所属人物、関連領地
- **年代ビュー** — 特定年のスナップショット（将軍・各領地の藩主・石高ランキング）
- **将軍一覧** — 徳川将軍15代の一覧と詳細

## 技術スタック

| レイヤー | 技術 |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript strict) |
| UI | Tailwind CSS v4 + shadcn/ui v4 |
| DB | PostgreSQL 17 (Docker local / Neon prod) |
| ORM | Prisma 7 |
| Test | Vitest + Testing Library + MSW |
| Lint | ESLint 9 (flat config) + Prettier |

## セットアップ

### 前提

- Node.js 20+
- Docker（ローカルDB用）

### 手順

```bash
# 依存インストール
npm install

# ローカルDB起動
docker compose up -d

# Prisma Client生成 & マイグレーション
npm run db:generate
npm run db:migrate

# シードデータ投入
npm run db:seed

# 開発サーバー起動
npm run dev
```

http://localhost:3000 でアクセス。

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

# 本番DB操作（Neon）— .env.production を参照
npm run db:prod:migrate  # 本番マイグレーション適用
npm run db:prod:seed     # 本番シードデータ投入
npm run db:prod:status   # 本番マイグレーション状態確認
```

## 環境変数

| ファイル | 用途 |
|---|---|
| `.env` | ローカル開発（Docker PostgreSQL） |
| `.env.production` | 本番DB操作（Neon） |

Vercel デプロイ時は Vercel ダッシュボードの Environment Variables に `DATABASE_URL` を設定。

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
├── lib/                  # ユーティリティ・マッパー
├── types/                # 型定義
└── generated/            # Prisma Client（gitignore済み）

prisma/
├── schema.prisma
├── seed.ts               # upsertベースのシード
└── seed-data/            # JSONマスタデータ（正のデータソース）
```

## 開発方針

- **TDD**: Red → Green → Refactor のサイクルで開発
- **シードデータ**: `prisma/seed-data/*.json` に分離、upsertで冪等管理
- **ID設計**: `Int @default(autoincrement())` + `String @unique` key（upsert用）
