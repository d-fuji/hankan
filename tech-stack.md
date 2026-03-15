# 技術構成リファレンス

Museum Finder の技術構成を横展開するための資料。

## 技術スタック概要

| レイヤー       | 技術                              | バージョン    |
| -------------- | --------------------------------- | ------------- |
| フレームワーク | Next.js (App Router)              | 16.1.6        |
| 言語           | TypeScript (strict)               | 5             |
| UI             | React                             | 19.2.3        |
| スタイル       | Tailwind CSS v4 + shadcn/ui v4    | 4             |
| データ取得     | SWR                               | 2.4.1         |
| ORM            | Prisma                            | 7.4.2         |
| DB             | PostgreSQL (Neon / ローカル)      | -             |
| 認証           | Auth.js (next-auth v5 beta)       | 5.0.0-beta.30 |
| テスト         | Vitest + Testing Library + MSW    | 4.0.18        |
| リント         | ESLint 9 (flat config) + Prettier | 9 / 3.8.1     |
| アイコン       | Lucide React                      | 0.577.0       |
| 地図           | react-map-gl + MapLibre GL JS     | 8.1.0         |
| OGP 画像       | @vercel/og (Satori)               | 0.11.1        |

---

## 設定ファイル一覧

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

ポイント: `strict: true`、`@/*` エイリアス、`skipLibCheck: true` でビルド高速化。

### next.config.ts

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

### ESLint (eslint.config.mjs)

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

ポイント: ESLint 9 フラット形式。`eslint-config-prettier` で Prettier と共存。

### Prettier (.prettierrc)

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

### PostCSS (postcss.config.mjs)

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

Tailwind CSS v4 では `tailwind.config.ts` は不要。`globals.css` で設定する。

---

## テスト構成

### Vitest (vitest.config.ts)

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/__tests__/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### セットアップ (vitest.setup.ts)

```typescript
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

### SWR テストユーティリティ (src/lib/test-utils.tsx)

```tsx
import { SWRConfig } from "swr";

export function SWRTestProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
  );
}
```

SWR のキャッシュをテスト間で分離するためのラッパー。

### MSW (src/mocks/server.ts)

```typescript
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

テストでの使用パターン:

```typescript
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

const server = setupServer(
  http.get("/api/museums/1", () => {
    return HttpResponse.json(museumDetail);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### テスト配置規則

- テストファイルは対象モジュールの隣に `__tests__/` ディレクトリを作成
- ファイル名: `*.test.ts` / `*.test.tsx`

---

## Prisma 構成

### prisma.config.ts

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx --tsconfig tsconfig.json prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL_UNPOOLED || env("DATABASE_URL"),
  },
});
```

### Prisma Client インスタンス (src/lib/prisma.ts)

```typescript
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

async function createAdapter() {
  if (process.env.NODE_ENV === "production") {
    const { PrismaNeon } = await import("@prisma/adapter-neon");
    return new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  }
  const { PrismaPg } = await import("@prisma/adapter-pg");
  return new PrismaPg({ connectionString: process.env.DATABASE_URL! });
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter: await createAdapter() });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

ポイント:

- 本番は `@prisma/adapter-neon`、ローカルは `@prisma/adapter-pg` で自動切替
- `globalForPrisma` で開発時の Hot Reload による接続リーク防止
- import は `@/generated/prisma/client`（`@prisma/client` は使わない）
- 出力先 `src/generated/prisma/` は `.gitignore` 済み

### ID 戦略

- ドメインモデル（Museum, Review, Tag 等）: `INTEGER @default(autoincrement())`
- Auth.js モデル（User, Account, Session）: `STRING @default(cuid())`

### npm scripts

| コマンド                         | 用途                         |
| -------------------------------- | ---------------------------- |
| `npm run db:generate`            | Prisma Client 再生成         |
| `npm run db:migrate`             | マイグレーション作成・適用   |
| `npm run db:migrate:status`      | 適用状況確認                 |
| `npm run db:seed`                | シードデータ投入             |
| `npm run db:reset`               | DB 初期化（全削除 + 再作成） |
| `npm run db:migrate:deploy:prod` | 本番マイグレーション適用     |

---

## 認証構成 (Auth.js v5)

### src/auth.ts

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { findUserByEmail, verifyPassword } from "@/lib/auth-helpers";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma as Parameters<typeof PrismaAdapter>[0]),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await findUserByEmail(credentials.email as string);
        if (!user?.password) return null;
        const isValid = await verifyPassword(credentials.password as string, user.password);
        if (!isValid) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
```

ポイント:

- JWT セッション戦略（DB セッションではない）
- `PrismaAdapter` の型キャストは `prisma as Parameters<typeof PrismaAdapter>[0]`（`any` は使わない）
- パスワードハッシュは `bcryptjs`

### API Route

```typescript
// src/app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

---

## shadcn/ui 構成 (components.json)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## ディレクトリ構成

```
src/
├── app/                  # ページ + API routes
│   ├── api/              # API ルート
│   ├── __tests__/        # ページテスト
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── auth.ts               # Auth.js 設定
├── components/           # UI コンポーネント
│   ├── __tests__/
│   └── ui/               # shadcn/ui
├── types/                # 型定義
│   └── api.ts            # API 型（← openapi.yaml）
├── data/                 # JSON フィクスチャ
├── lib/                  # ユーティリティ・マッパー
│   ├── __tests__/
│   ├── prisma.ts         # Prisma インスタンス
│   ├── api.ts            # API クライアント
│   └── test-utils.tsx    # テストユーティリティ
├── mocks/                # MSW ハンドラー
│   ├── server.ts
│   └── handlers.ts
└── generated/            # Prisma Client（gitignore 済み）
    └── prisma/

prisma/
├── schema.prisma
├── seed.ts
└── migrations/

docs/
├── openapi.yaml          # API 仕様
└── specs/                # 機能仕様書
```

---

## 環境変数 (.env.sample)

```
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname?schema=public"
AUTH_SECRET="your-auth-secret"
```

本番では Neon の接続文字列と `DATABASE_URL_UNPOOLED`（マイグレーション用）を追加。

---

## 開発フロー

### セットアップ

```bash
npm install
cp .env.sample .env       # 環境変数設定
npm run db:generate       # Prisma Client 生成
npm run db:migrate        # マイグレーション適用
npm run db:seed           # シードデータ投入
npm run dev               # 開発サーバー起動
```

### 日常の開発サイクル

```bash
npm run dev               # 開発
npm run test              # テスト
npm run lint              # リント
npm run format:check      # フォーマットチェック
```

### ビルド・デプロイ

```bash
npm run build             # ビルド（prisma generate 含む）
npm run db:migrate:deploy:prod  # 本番マイグレーション
```

---

## 設計パターン

### 仕様駆動開発

権威構造: `docs/specs/` → `docs/openapi.yaml` → `src/types/api.ts` → 実装コード

### マッパー関数

Prisma の DB 行 → API レスポンス型の変換を `src/lib/` に集約。`null` → `undefined` 変換もマッパー内で一元管理。

```typescript
// src/lib/museum-utils.ts
export function toMuseumSummary(museum: MuseumRow): MuseumSummary {
  return {
    id: museum.id,
    name: museum.name,
    description: museum.description ?? undefined, // null → undefined
    // ...
  };
}
```

### テスト戦略

- **ユニットテスト**: バリデーション・マッパー関数など純粋ロジック
- **コンポーネントテスト**: MSW + SWRTestProvider で API モック付き UI テスト
- **テスト配置**: `__tests__/` ディレクトリ（対象モジュールの隣）
