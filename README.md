# Scan2Meet

名刺をスキャンして情報を抽出し、その場でつながるための Web アプリケーションです。デバイスのカメラや画像ファイルから名刺を読み取り、Gemini API（AI SDK 経由）を利用して情報を解析・表示します。
https://scan-2-meet.com/
## 機能

- **名刺スキャン:** デバイスのカメラまたは画像ファイルから名刺を読み込みます。
- **AI による情報抽出:** Gemini 3 Flash Preview を使用して、氏名、会社名、役職、連絡先などの情報を高精度で抽出します。
- **情報の編集:** 抽出された名刺情報をその場で編集できます。
- **AI リサーチ:** Google 検索グラウンディングを活用し、相手の会社・部署に関する情報を AI がリサーチします。
- **日程調整リンク:** HubSpot 等の日程調整リンクを最大3件登録でき、名刺スキャン後にワンタップで日程調整ページを開けます。抽出された名刺情報がクエリパラメータとして自動付与されます。
- **連携機能:**
  - Facebook で名前を検索
  - Google で名前・会社名・部署名を検索

## 技術スタック

- **フロントエンド:** React 19, TypeScript, Vite
- **UI ライブラリ:** Radix UI Themes
- **カメラ:** react-camera-pro
- **AI:** Vercel AI SDK (`ai` + `@ai-sdk/google`) / Gemini 3 Flash Preview
- **アイコン:** Lucide React
- **パッケージマネージャ:** pnpm

## セットアップと実行

1. **リポジトリをクローン:**
   ```bash
   git clone <repository-url>
   cd Scan2Meet
   ```

2. **依存関係をインストール:**
   ```bash
   pnpm install
   ```

3. **環境変数を設定:**

   プロジェクトルートに `.env` ファイルを作成し、API キーを設定します。

   ```dotenv
   # Google Gemini API Key（必須）
   VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```

4. **開発サーバーを起動:**
   ```bash
   pnpm dev
   ```

5. ブラウザで `http://localhost:5173` を開きます。

## 環境変数

| 変数名 | 必須 | デフォルト | 説明 |
|---|---|---|---|
| `VITE_GEMINI_API_KEY` | はい | — | Google Gemini API キー。[Google AI Studio](https://aistudio.google.com/app/apikey) から取得できます。 |
| `VITE_QUERY_PARAM_LAST_NAME` | いいえ | `lastName` | 日程調整リンクに渡す「姓」のクエリパラメータ名 |
| `VITE_QUERY_PARAM_FIRST_NAME` | いいえ | `firstName` | 日程調整リンクに渡す「名」のクエリパラメータ名 |
| `VITE_QUERY_PARAM_FULL_NAME` | いいえ | `fullName` | 日程調整リンクに渡す「氏名」のクエリパラメータ名 |
| `VITE_QUERY_PARAM_DEPARTMENT` | いいえ | `department` | 日程調整リンクに渡す「部署名」のクエリパラメータ名 |
| `VITE_QUERY_PARAM_COMPANY` | いいえ | `company` | 日程調整リンクに渡す「会社名」のクエリパラメータ名 |
| `VITE_QUERY_PARAM_EMAIL` | いいえ | `email` | 日程調整リンクに渡す「メールアドレス」のクエリパラメータ名 |
| `VITE_QUERY_PARAM_PHONE` | いいえ | `phone` | 日程調整リンクに渡す「電話番号」のクエリパラメータ名 |

## 使い方

1. アプリケーションをブラウザで開きます。
2. **日程調整リンクを設定（初回）:** カメラ画面下部の「Hubspot日程調整リンクを設定」ボタンから、HubSpot 等の日程調整リンクを登録します（最大3件）。設定はブラウザの LocalStorage に保存され、次回以降も利用できます。
3. 撮影ボタンを押してカメラで名刺を撮影するか、「画像をアップロード」ボタンで画像ファイルを選択します。
4. 画像がアップロードされると、自動的に Gemini API による名刺情報の解析が開始されます。
5. 解析結果がカード形式で表示されます。編集アイコンを押すと情報を修正できます。
6. 必要に応じて、以下のボタンを利用します:
   - **日程調整リンク:** 登録済みの日程調整リンクを開きます。名刺情報がクエリパラメータとして自動付与されます。
   - **AI リサーチ:** 相手の会社・部署に関する情報を AI がリサーチします。
   - **Facebook / Google 検索:** 名前や会社名で検索します。
7. 「リセット」ボタンを押すと、新しい名刺をスキャンできる状態に戻ります。

## ビルド

```bash
pnpm build
```

ビルド成果物は `dist/` ディレクトリに出力されます。
