import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri, // 追加
} from "@google/genai";

// APIキーを環境変数から取得
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Gemini APIクライアントの初期化
const ai = new GoogleGenAI({ apiKey });

// 会社名でリサーチする関数
export const researchCompany = async (companyName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        `${companyName}について以下の情報を調査して日本語で要約してください：
        1. 会社概要（設立年、本社所在地、従業員数など）
        2. 主な事業内容
        3. 業界での位置づけ
        4. 最近のニュースや動向
        
        簡潔にまとめてください。`,
      ],
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    return {
      summary: response.text,
      sources:
        response.candidates?.[0]?.groundingMetadata?.searchEntryPoint
          ?.renderedContent || null,
    };
  } catch (error) {
    console.error("会社リサーチエラー:", error);
    throw error;
  }
};

// 名刺画像を解析する関数 (ai.files.upload を使用)
export const analyzeBusinessCard = async (imageFile: File) => {
  try {
    // 1. 画像ファイルをアップロード
    console.log(
      "Uploading business card image...",
      imageFile.name,
      imageFile.type
    );
    const uploadedFile = await ai.files.upload({
      file: imageFile,
    });
    console.log("Business card image uploaded:", uploadedFile);

    // uploadedFile とそのプロパティの存在を確認
    if (!uploadedFile?.uri || !uploadedFile?.mimeType) {
      throw new Error(
        `Business card image upload failed. Response: ${JSON.stringify(
          uploadedFile
        )}`
      );
    }

    // 2. プロンプトを定義
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
      
      JSONのみを返してください。情報が見つからない場合は、対応するフィールドを空文字列にしてください。
      名前は必ず姓（lastName）と名（firstName）に分けてください。日本語の名前の場合、「山田」が姓で「太郎」が名です。
      部署名（department）は、「営業部」「技術部」「マーケティング部」などの部署を指します。
    `;

    // 3. アップロードされた画像のURIを使用してコンテンツ生成
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        createUserContent([
          prompt,
          // アップロードされた画像のURIを使用
          createPartFromUri(uploadedFile.uri, uploadedFile.mimeType),
        ]),
      ],
    });

    // 4. レスポンスからJSONを抽出して解析
    const text = response.text;

    // JSONを抽出して解析
    const jsonMatch = text?.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("JSONデータが見つかりませんでした");
  } catch (error) {
    console.error("名刺解析エラー:", error);
    throw error;
  }
};
