import {
  GoogleGenAI,
  createUserContent,
  createPartFromUri, // 追加
} from "@google/genai";

// APIキーを環境変数から取得
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// Gemini APIクライアントの初期化
const ai = new GoogleGenAI({ apiKey });

// 会社名と人物名でリサーチする関数 (personName パラメータを追加)
export const researchCompany = async (
  companyName: string,
  personName: string
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        `${companyName} およびその会社に所属する ${personName} について、公開されている情報を元に以下の点を調査して日本語で要約してください：
        【会社について】
        1. 会社概要（設立年、本社所在地、従業員数など）
        2. 主な事業内容
        3. 業界での位置づけ
        4. 最近のニュースや動向
        【人物について】（公開情報がない場合は「不明」と記載）
        1. ${personName} の役職や経歴（もしあれば）
        2. ${personName} に関連する最近のニュースや活動（もしあれば）
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

// 会社名と部署名でリサーチする関数
export const researchDepartment = async (
  companyName: string,
  departmentName: string
) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        `${companyName} の ${departmentName} について以下の情報を調査して日本語で要約してください：
        1. 部署の主な役割や担当業務
        2. 部署の組織構造やチーム構成（もし情報があれば）
        3. 部署に関連する最近のニュースや取り組み
        
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
    console.error("部署リサーチエラー:", error);
    throw error;
  }
};

// 会社、人物、部署をまとめてリサーチする関数
export const researchAll = async (
  companyName: string,
  personName: string,
  departmentName: string | null | undefined // departmentName をオプショナルに変更
) => {
  try {
    // プロンプトを動的に構築
    let prompt = `${companyName} および所属する ${personName} について、公開されている情報を元に以下の点を調査して日本語で要約してください：
        【会社について】
        1. 会社概要（設立年、本社所在地、従業員数など）
        2. 主な事業内容
        3. 業界での位置づけ
        4. 最近のニュースや動向
        【人物について】（公開情報がない場合は「不明」と記載）
        1. ${personName} の役職や経歴（もしあれば）
        2. ${personName} に関連する最近のニュースや活動（もしあれば）`;

    // departmentName が存在する場合のみ部署情報を追加
    if (departmentName) {
      prompt += `
        【部署について】（公開情報がない場合は「不明」と記載）
        1. ${departmentName} の主な役割や担当業務
        2. ${departmentName} の組織構造やチーム構成（もし情報があれば）
        3. ${departmentName} に関連する最近のニュースや取り組み`;
    }

    prompt += `
        
        簡潔にまとめてください。`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [prompt], // 動的に生成したプロンプトを使用
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
    console.error("まとめてリサーチエラー:", error);
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
      電話番号（phone）は、ハイフンを含めても含まなくても構いません。抽出できた形式で返してください。 // 電話番号に関する補足を追加
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
