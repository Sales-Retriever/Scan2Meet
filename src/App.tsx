import { useState } from "react";
import { Container, Flex, Heading, Text, Box } from "@radix-ui/themes";
import "./App.css";

// コンポーネントとサービスのインポート
import Camera from "./components/Camera";
import BusinessCardInfo, {
  BusinessCardData,
} from "./components/BusinessCardInfo";
import { analyzeBusinessCard } from "./services/gemini";

function App() {
  // 状態管理
  const [_imageData, setImageData] = useState<string | null>(null);
  const [cardData, setCardData] = useState<BusinessCardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 画像キャプチャ時の処理
  const handleCapture = async (capturedImageData: string) => {
    setImageData(capturedImageData);
    setIsLoading(true);
    setError(null);

    try {
      // Gemini APIで名刺を解析
      const result = await analyzeBusinessCard(capturedImageData);
      setCardData(result);
    } catch (err) {
      console.error("名刺解析エラー:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(`名刺の解析中にエラーが発生しました: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // リセット処理
  const handleReset = () => {
    setImageData(null);
    setCardData(null);
    setError(null);
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
          <Text size="2" style={{ color: "white" }}>
            名刺からその場でつながる
          </Text>
        </Box>

        <Flex
          direction="column"
          align="center"
          gap="1"
          py="2"
          px="4"
          style={{ backgroundColor: "#f5f5f5", flex: 1 }}
        >
          <Camera onCapture={handleCapture} onReset={handleReset} />

          {(isLoading || cardData || error) && (
            <BusinessCardInfo
              data={cardData}
              isLoading={isLoading}
              error={error}
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
