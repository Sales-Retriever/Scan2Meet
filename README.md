# Scan2Meet

名刺をスキャンして情報を抽出し、その場でつながるための Web アプリケーションです。デバイスのカメラや画像ファイルから名刺を読み取り、Google Gemini API を利用して情報を解析・表示します。

## ✨ 機能

- 📷 **名刺スキャン:** デバイスのカメラまたは画像ファイルから名刺を読み込みます。
- 🧠 **AI による情報抽出:** Google Gemini API を使用して、氏名、会社名、役職、連絡先などの情報を高精度で抽出します。
- 📊 **情報表示:** 抽出された情報を分かりやすく表示します。
- 🔗 **連携機能:**
  - SNS (Facebook) で名前を検索
  - Google 検索で名前を検索
  - 外部の日程調整ツールと連携 (URL は環境変数で設定)
  - 会社情報を Gemini API でリサーチ

## 🛠️ 技術スタック

- **フロントエンド:** React, TypeScript, Vite
- **UI ライブラリ:** Radix UI Themes
- **カメラ:** react-webcam
- **AI:** Google Gemini API (@google/genai)
- **アイコン:** Lucide React

## 🚀 セットアップと実行

1.  **リポジトリをクローン:**
    ```bash
    git clone <repository-url>
    cd Scan2Meet
    ```
2.  **依存関係をインストール:**
    ```bash
    npm install
    ```
3.  **環境変数を設定:**
    - プロジェクトルートに `.env` ファイルを作成します。
    - 必要な環境変数を設定します。詳細は `.env.example` ファイルを参照してください。
    ```dotenv
    # .env ファイルの例
    VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    VITE_SCHEDULE_TOOL_URL=https://example.com/schedule
    ```
4.  **開発サーバーを起動:**
    ```bash
    npm run dev
    ```
5.  ブラウザで `http://localhost:5173` (または Vite が表示するポート) を開きます。

## ⚙️ 環境変数

アプリケーションの実行には以下の環境変数が必要です。プロジェクトルートに `.env` ファイルを作成して設定してください。

- `VITE_GEMINI_API_KEY`: Google Gemini API を使用するための API キーです。(**必須**)
- `VITE_SCHEDULE_TOOL_URL`: 「日程調整」ボタンがリンクする先のベース URL です。(任意)
- `VITE_QUERY_PARAM_LAST_NAME`: 日程調整ツールに渡す「姓」のクエリパラメータ名です。(任意、デフォルト: `lastName`)
- `VITE_QUERY_PARAM_FIRST_NAME`: 日程調整ツールに渡す「名」のクエリパラメータ名です。(任意、デフォルト: `firstName`)
- `VITE_QUERY_PARAM_DEPARTMENT`: 日程調整ツールに渡す「部署名」のクエリパラメータ名です。(任意、デフォルト: `department`)
- `VITE_QUERY_PARAM_COMPANY`: 日程調整ツールに渡す「会社名」のクエリパラメータ名です。(任意、デフォルト: `company`)
- `VITE_QUERY_PARAM_EMAIL`: 日程調整ツールに渡す「メールアドレス」のクエリパラメータ名です。(任意、デフォルト: `email`)

`.env.example` ファイルを参考にしてください。

## 使い方

1.  アプリケーションをブラウザで開きます。
2.  「撮影」ボタンを押してカメラで名刺を撮影するか、「画像をアップロード」ボタンで画像ファイルを選択します。
3.  画像がアップロードされると、自動的に Gemini API による名刺情報の解析が開始されます。
4.  解析結果がカード形式で表示されます。氏名、会社名、役職、連絡先などが確認できます。
5.  必要に応じて、以下のボタンを利用します:
    - **Facebook アイコン:** Facebook で氏名を検索します。
    - **検索アイコン:** Google で氏名を検索します。
    - **日程調整:** 設定された外部の日程調整ツールへ遷移します（抽出された情報がクエリパラメータとして渡されます）。
    - **会社をリサーチ:** Gemini API を使用して、表示されている会社名に関する情報をリサーチし、結果を表示します。
6.  「リセット」ボタンを押すと、表示されている画像と解析結果がクリアされ、新しい名刺をスキャンできる状態に戻ります。
