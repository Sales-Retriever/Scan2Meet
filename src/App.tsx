import { useState } from "react";
import { Container, Flex, Heading, Text, Box } from "@radix-ui/themes";
import "./App.css";

import CameraComponent from "./components/Camera";
import BusinessCardInfo from "./components/BusinessCardInfo";
import type { BusinessCardData } from "./types";
import { analyzeBusinessCard } from "./services/gemini";
import { useResearch } from "./hooks/useResearch";
import { formatError } from "./utils/formatError";

function App() {
  const [cardData, setCardData] = useState<BusinessCardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { researchResult, executeResearch, resetResearch } = useResearch();

  const handleCapture = async (
    _capturedImageData: string,
    capturedImageFile: File
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeBusinessCard(capturedImageFile);
      setCardData(result);
      executeResearch(result, 500);
    } catch (err) {
      console.error("Full Gemini Error:", err);
      setError(`名刺の解析中にエラーが発生しました:\n${formatError(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCardData(null);
    setError(null);
    resetResearch();
  };

  const handleUpdate = (updatedData: BusinessCardData) => {
    const shouldReResearch =
      cardData &&
      (cardData.company !== updatedData.company ||
        cardData.lastName !== updatedData.lastName ||
        cardData.firstName !== updatedData.firstName ||
        cardData.department !== updatedData.department);

    setCardData(updatedData);

    if (shouldReResearch && updatedData.company) {
      executeResearch(updatedData, 500);
    }
  };

  return (
    <Container>
      <Flex direction="column" style={{ minHeight: "100vh", backgroundColor: "#f7f7f7" }}>
        <Box
          style={{
            backgroundColor: "#f7f7f7",
            textAlign: "center",
          }}
        >
          <Flex align="center" justify="center" gap="2">
            <img src="/logo.png" alt="Scan2Meet" style={{ height: "32px" }} />
            <Heading size="5">Scan2Meet</Heading>
          </Flex>
        </Box>

        <Flex
          direction="column"
          align="center"
          gap="1"
          py="1"
          px="4"
          height="100%"
          style={{ flex: 1, overflowY: "auto" }}
          justify="end"
        >
          {!(isLoading || cardData || error) ? (
            <CameraComponent
              onCapture={handleCapture}
              onReset={handleReset}
              isLoading={isLoading}
            />
          ) : (
            <BusinessCardInfo
              data={cardData}
              isLoading={isLoading}
              error={error}
              researchResult={researchResult}
              onResearch={() => cardData && executeResearch(cardData)}
              onUpdate={handleUpdate}
              onReset={handleReset}
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
