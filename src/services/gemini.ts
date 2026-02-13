import {
  createGoogleGenerativeAI,
  type GoogleGenerativeAIProviderMetadata,
  type GoogleGenerativeAIProviderOptions,
} from "@ai-sdk/google";
import { generateText } from "ai";

// APIキーを環境変数から取得してプロバイダを初期化
const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

// モデルの初期化
const model = google("gemini-3-flash-preview");

// Thinking を最小限に設定
const providerOptions = {
  google: {
    thinkingConfig: {
      thinkingLevel: "minimal",
    },
  } satisfies GoogleGenerativeAIProviderOptions,
};

// File を base64 文字列に変換するヘルパー
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // data:image/png;base64,... から base64 部分を抽出
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// グラウンディングメタデータからソースを取得するヘルパー
const extractSources = (
  providerMetadata: Record<string, Record<string, unknown>> | undefined
): string | null => {
  const metadata = providerMetadata?.google as
    | GoogleGenerativeAIProviderMetadata
    | undefined;
  return (
    (
      metadata?.groundingMetadata as {
        searchEntryPoint?: { renderedContent?: string };
      }
    )?.searchEntryPoint?.renderedContent || null
  );
};

// 会社名と人物名でリサーチする関数
export const researchCompany = async (
  companyName: string,
  personName: string
) => {
  try {
    const { text, providerMetadata } = await generateText({
      model,
      providerOptions,
      tools: { google_search: google.tools.googleSearch({}) },
      prompt: `${companyName} およびその会社に所属する ${personName} について、公開されている情報を元に以下の点を調査して日本語で要約してください：
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
    });

    return {
      summary: text,
      sources: extractSources(providerMetadata),
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
    const { text, providerMetadata } = await generateText({
      model,
      providerOptions,
      tools: { google_search: google.tools.googleSearch({}) },
      prompt: `${companyName} の ${departmentName} について以下の情報を調査して日本語で要約してください：
        1. 部署の主な役割や担当業務
        2. 部署の組織構造やチーム構成（もし情報があれば）
        3. 部署に関連する最近のニュースや取り組み

        簡潔にまとめてください。`,
    });

    return {
      summary: text,
      sources: extractSources(providerMetadata),
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
  departmentName: string | null | undefined
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

    const { text, providerMetadata } = await generateText({
      model,
      providerOptions,
      tools: { google_search: google.tools.googleSearch({}) },
      prompt,
    });

    return {
      summary: text,
      sources: extractSources(providerMetadata),
    };
  } catch (error) {
    console.error("まとめてリサーチエラー:", error);
    throw error;
  }
};

// 名刺画像を解析する関数
export const analyzeBusinessCard = async (imageFile: File) => {
  try {
    console.log(
      "Analyzing business card image...",
      imageFile.name,
      imageFile.type
    );

    // 画像を base64 に変換
    const base64Data = await fileToBase64(imageFile);

    const prompt = `この画像は名刺です。名刺から以下の情報を抽出してJSON形式で返してください:
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
      電話番号（phone）は、ハイフンを含めても含まなくても構いません。抽出できた形式で返してください。`;

    const { text } = await generateText({
      model,
      providerOptions,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image", image: base64Data },
          ],
        },
      ],
    });

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
