# コントリビューションガイド

Scan2Meet へのコントリビュートに興味をお持ちいただきありがとうございます！

## 開発環境のセットアップ

### 前提条件

- Node.js 20 以上
- pnpm 10 以上

### 手順

```bash
# リポジトリをフォーク＆クローン
git clone https://github.com/<your-username>/Scan2Meet.git
cd Scan2Meet

# 依存関係をインストール
pnpm install

# 環境変数を設定
cp .env.example .env
# .env を編集して VITE_GEMINI_API_KEY を設定

# 開発サーバーを起動
pnpm dev
```

## ブランチ戦略

- `main` ブランチが最新の安定版です。
- 新機能やバグ修正は `main` から新しいブランチを作成してください。
- ブランチ名の例: `feature/add-xxx`, `fix/resolve-yyy`

## Pull Request の出し方

1. フォークしたリポジトリで作業用ブランチを作成します。
2. 変更をコミットします。
3. `pnpm build` が通ることを確認します。
4. Pull Request を作成し、変更内容を説明してください。

## コーディング規約

- **言語:** TypeScript（strict モード）
- **フレームワーク:** React 19（関数コンポーネント + Hooks）
- **スタイル:** Radix UI Themes を使用
- **リント:** `pnpm lint` でエラーがないことを確認してください
- **型安全:** `any` の使用は避け、適切な型定義を行ってください
- **命名規則:**
  - コンポーネント: PascalCase（例: `BusinessCardInfo`）
  - 関数・変数: camelCase（例: `handleCapture`）
  - 型・インターフェース: PascalCase（例: `BusinessCardData`）
  - ファイル名: コンポーネントは PascalCase、その他は camelCase

## 問題の報告

バグや改善提案がありましたら、[Issues](https://github.com/Sales-Retriever/Scan2Meet/issues) からお知らせください。
