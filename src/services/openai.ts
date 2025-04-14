import OpenAI from "openai";

// APIキーを環境変数から取得
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// OpenAIクライアントの初期化
// dangerouslyAllowBrowser: true はクライアントサイドでの使用を許可するために必要
// 注意: クライアントサイドでAPIキーを直接扱うのはセキュリティリスクがあります。
// 本番環境では、API呼び出しをバックエンド経由で行うことを強く推奨します。
const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });

// ファイルをBase64に変換する関数 (gemini.tsからコピー)
export const fileToBase64 = async (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject; // エラーハンドリングを追加
    reader.readAsDataURL(file);
  });
};

// OpenAI GPT-4o を使用して名刺画像を解析する関数
export const analyzeBusinessCardWithOpenAI = async (imageFile: File) => {
  try {
    // 1. 画像ファイルをBase64に変換
    const base64Image = await fileToBase64(imageFile);
    // "data:image/jpeg;base64," のようなプレフィックスを除去する必要があるか確認
    // OpenAIのAPIはプレフィックス付きのData URL形式を受け入れることが多い
    // const base64Data = base64Image.split(",")[1]; // 不要かもしれない

    // 2. プロンプトを定義 (Geminiと同様)
    const prompt = `
      この画像は名刺です。名刺から以下の情報を抽出してJSON形式で返してください:
      - 姓（lastName）
      - 名（firstName）
      - 役職（position）
      - 部署名（department）
      - 会社名（company）
      - 電話番号（phone）
      - メールアドレス（email）
      - 住所（address）
      - ウェブサイト（website）
      
      JSONオブジェクトのみを返してください。他のテキストは含めないでください。
      情報が見つからない場合は、対応するフィールドを空文字列 "" にしてください。
      名前は必ず姓（lastName）と名（firstName）に分けてください。日本語の名前の場合、「山田」が姓で「太郎」が名です。
      部署名（department）は、「営業部」「技術部」「マーケティング部」などの部署を指します。
    `;

    // 3. OpenAI APIにリクエストを送信
    console.log("Sending request to OpenAI GPT-4o...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: base64Image, // Data URL形式で渡す
              },
            },
          ],
        },
      ],
      max_tokens: 1000, // 必要に応じて調整
      // JSONモードを有効にする (gpt-4oは対応しているはず)
      response_format: { type: "json_object" },
    });
    console.log("Received response from OpenAI.");

    // 4. レスポンスからJSONを抽出して解析
    const messageContent = response.choices[0]?.message?.content;

    if (!messageContent) {
      throw new Error("OpenAIからの応答が空です。");
    }

    try {
      // JSONモードが有効な場合、contentはJSON文字列のはず
      const parsedJson = JSON.parse(messageContent);
      return parsedJson;
    } catch (parseError) {
      console.error("OpenAI応答のJSON解析エラー:", parseError);
      console.error("受信したテキスト:", messageContent);
      // フォールバック: テキストからJSONを抽出試行 (Geminiと同様)
      const jsonMatch = messageContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (fallbackParseError) {
          console.error("フォールバックJSON解析エラー:", fallbackParseError);
          throw new Error("OpenAIからの応答をJSONとして解析できませんでした。");
        }
      }
      throw new Error("OpenAIからの応答に有効なJSONが含まれていませんでした。");
    }
  } catch (error) {
    console.error("OpenAI名刺解析エラー:", error);
    throw error;
  }
};
