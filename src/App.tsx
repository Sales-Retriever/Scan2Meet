import { useState } from "react";
import { Container, Flex, Heading, Text, Box } from "@radix-ui/themes";
import "./App.css";

// コンポーネントとサービスのインポート
import CameraComponent from "./components/Camera"; // Camera を CameraComponent に変更
import BusinessCardInfo, {
  BusinessCardData,
} from "./components/BusinessCardInfo";
import { analyzeBusinessCard, researchAll } from "./services/gemini"; // researchAllをインポート
// import { analyzeBusinessCardWithOpenAI } from "./services/openai"; // OpenAI版をコメントアウト

function App() {
  // 状態管理
  const [_imageData, setImageData] = useState<string | null>(null); // プレビュー用
  // Fileオブジェクトも状態として持つ（省略可能だが、再試行などに使えるかも）
  // const [imageFile, setImageFile] = useState<File | null>(null);
  const [cardData, setCardData] = useState<BusinessCardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // リサーチ結果の状態を追加
  const [researchResult, setResearchResult] = useState<{
    isLoading: boolean;
    data: { summary: string | undefined; sources: string | null } | null;
    error: string | null;
  }>({
    isLoading: false,
    data: null,
    error: null,
  });

  // 画像キャプチャ時の処理 (Fileオブジェクトも受け取るように変更)
  const handleCapture = async (
    capturedImageData: string,
    capturedImageFile: File
  ) => {
    setImageData(capturedImageData); // プレビュー用にBase64も保持
    // setImageFile(capturedImageFile); // 必要ならFileオブジェクトも保持
    setIsLoading(true);
    setError(null);
    try {
      // Gemini APIで名刺を解析 (Fileオブジェクトを渡す)
      const result = await analyzeBusinessCard(capturedImageFile);
      // 名刺データをセットして表示を更新
      setCardData(result);

      // 少し遅延させてからAIリサーチを実行（名刺情報を先に表示するため）
      setTimeout(() => {
        // 名刺解析が完了したら、自動的にリサーチを実行
        if (result && result.company) {
          const fullName =
            result.lastName && result.firstName
              ? `${result.lastName} ${result.firstName}`
              : result.lastName || result.firstName || "";

          if (fullName) {
            // リサーチ開始
            setResearchResult({
              isLoading: true,
              data: null,
              error: null,
            });

            researchAll(result.company, fullName, result.department)
              .then((researchData) => {
                setResearchResult({
                  isLoading: false,
                  data: researchData,
                  error: null,
                });
              })
              .catch((researchErr) => {
                console.error("Full Research Error:", researchErr);
                let researchErrorMessage = "不明なエラーが発生しました。";
                if (researchErr instanceof Error) {
                  researchErrorMessage = `${researchErr.message}${
                    researchErr.stack ? `\nStack: ${researchErr.stack}` : ""
                  }`;
                } else {
                  researchErrorMessage = String(researchErr);
                }
                setResearchResult({
                  isLoading: false,
                  data: null,
                  error: `情報のリサーチ中にエラーが発生しました:\n${researchErrorMessage}`,
                });
              });
          }
        }
      }, 500); // 500ミリ秒の遅延を設定
    } catch (err) {
      // より詳細なエラーログを出力
      console.error("Full Gemini Error:", err);
      let detailedErrorMessage = "不明なエラーが発生しました。";
      if (err instanceof Error) {
        detailedErrorMessage = `${err.message}${
          err.stack ? `\nStack: ${err.stack}` : ""
        }`;
      } else {
        detailedErrorMessage = String(err);
      }
      setError(`名刺の解析中にエラーが発生しました:\n${detailedErrorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // リセット処理
  const handleReset = () => {
    setImageData(null);
    setCardData(null);
    setError(null);
    setResearchResult({
      isLoading: false,
      data: null,
      error: null,
    });
  };

  return (
    <Container>
      <Flex direction="column" style={{ minHeight: "100vh" }}>
        <Box
          py="2"
          style={{
            backgroundColor: "var(--iris-9)",
            color: "white",
            textAlign: "center",
          }}
        >
          <Heading size="3" mb="1">
            Scan2Meet
          </Heading>
        </Box>

        <Flex
          direction="column"
          align="center"
          gap="1"
          py="2"
          px="4"
          height="100%"
          style={{ flex: 1 }}
          justify="end"
        >
          <CameraComponent
            onCapture={handleCapture}
            onReset={handleReset}
            isLoading={isLoading}
          />
          {(isLoading || cardData || error) && (
            <BusinessCardInfo
              data={cardData}
              isLoading={isLoading}
              error={error}
              researchResult={researchResult}
              onResearch={() => {
                // 手動でリサーチを実行する関数
                if (cardData && cardData.company) {
                  const fullName =
                    cardData.lastName && cardData.firstName
                      ? `${cardData.lastName} ${cardData.firstName}`
                      : cardData.lastName || cardData.firstName || "";

                  if (fullName) {
                    // リサーチ開始
                    setResearchResult({
                      isLoading: true,
                      data: null,
                      error: null,
                    });

                    researchAll(cardData.company, fullName, cardData.department)
                      .then((researchData) => {
                        setResearchResult({
                          isLoading: false,
                          data: researchData,
                          error: null,
                        });
                      })
                      .catch((researchErr) => {
                        console.error("Full Research Error:", researchErr);
                        let researchErrorMessage =
                          "不明なエラーが発生しました。";
                        if (researchErr instanceof Error) {
                          researchErrorMessage = `${researchErr.message}${
                            researchErr.stack
                              ? `\nStack: ${researchErr.stack}`
                              : ""
                          }`;
                        } else {
                          researchErrorMessage = String(researchErr);
                        }
                        setResearchResult({
                          isLoading: false,
                          data: null,
                          error: `情報のリサーチ中にエラーが発生しました:\n${researchErrorMessage}`,
                        });
                      });
                  }
                }
              }}
              onUpdate={(updatedData) => {
                // 編集された名刺データを更新
                setCardData(updatedData);

                // 会社名や名前が変更された場合、リサーチ結果をリセット
                const shouldResetResearch =
                  cardData &&
                  (cardData.company !== updatedData.company ||
                    cardData.lastName !== updatedData.lastName ||
                    cardData.firstName !== updatedData.firstName ||
                    cardData.department !== updatedData.department);

                if (shouldResetResearch) {
                  setResearchResult({
                    isLoading: false,
                    data: null,
                    error: null,
                  });
                }
              }}
            />
          )}
        </Flex>

        <Box
          py="4"
          style={{
            backgroundColor: "#f5f5f5",
            color: "#666",
            textAlign: "center",
            borderTop: "1px solid #ddd",
            fontSize: "14px",
          }}
        >
          <Text size="1">Produced by Sales Retriever</Text>
        </Box>
      </Flex>
    </Container>
  );
}

export default App;
