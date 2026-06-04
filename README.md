# FreeBill — 見積・請求・入金フォロー自動化システム

フリーランス・小規制作会社向けのバックオフィス単純化システムです。

## 機能

| 機能 | 説明 |
|---|---|
| 📝 見積書生成 | 品目・数量・単価を入力して見積書を作成 |
| 💰 請求書生成 | 見積書からワンクリックで請求書に変換 |
| 🖨 PDF出力 | 印刷ページからブラウザの印刷機能でPDF保存 |
| ✉ メール送付 | 見積書・請求書をHTMLメールで送付 |
| 🔔 リマインド | 延滞請求書への自動リマインドメール |
| ✅ 入金管理 | 入金確認・ステータス管理 |
| 📊 ダッシュボード | 未入金合計・延滞件数・今月入金の一覧 |

## 技術スタック

- **Next.js 15** (App Router + Server Components)
- **TypeScript**
- **Prisma** + SQLite (PostgreSQLに切り替え可)
- **Tailwind CSS v4**
- **Nodemailer** (メール送付)
- **Zod** (バリデーション)

## セットアップ

```bash
# 1. リポジトリクローン
git clone https://github.com/writer1410-cloud/billboard.git
cd billboard

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cp .env.example .env
# .env を編集してSMTP設定を入力

# 4. DB初期化
npm run db:push
npm run db:seed

# 5. 開発サーバ起動
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

## リマインドメールの一括送信

```bash
# 期限超過の全請求書にリマインドを送信
npm run reminders

# cronに登録する場合の例 (1日、1回、毎朝9時)
# 0 9 * * * cd /path/to/app && npm run reminders
```

## ページ構成

```
/                  ダッシュボード
/clients           クライアント一覧
/clients/new       クライアント登録
/clients/[id]      クライアント詳細
/quotes            見積書一覧
/quotes/new        見積書作成
/quotes/[id]       見積書詳細
/quotes/[id]/print 見積書印刷・PDF
/invoices          請求書一覧（ステータスフィルター付き）
/invoices/new      請求書作成
/invoices/[id]     請求書詳細
/invoices/[id]/print 請求書印刷・PDF
```

## 現在の制限事項

- メール送付はSMTP設定が必要です (Gmail App Password推奨)
- PDFはブラウザの印刷機能を利用
- SQLiteを使用しているため、本番環境ではPostgreSQLへの変更を推奨
