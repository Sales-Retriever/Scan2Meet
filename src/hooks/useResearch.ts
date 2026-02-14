import { useState, useCallback } from "react";
import { researchAll } from "../services/gemini";
import { formatError } from "../utils/formatError";
import type { BusinessCardData, ResearchResultState } from "../types";

export function getFullName(data: BusinessCardData): string {
  return data.lastName && data.firstName
    ? `${data.lastName} ${data.firstName}`
    : data.lastName || data.firstName || "";
}

const initialState: ResearchResultState = {
  isLoading: false,
  data: null,
  error: null,
};

export function useResearch() {
  const [researchResult, setResearchResult] =
    useState<ResearchResultState>(initialState);

  const executeResearch = useCallback(
    (data: BusinessCardData, delayMs = 0) => {
      const fullName = getFullName(data);
      if (!data.company || !fullName) return;

      const run = () => {
        setResearchResult({ isLoading: true, data: null, error: null });
        researchAll(data.company, fullName, data.department)
          .then((researchData) => {
            setResearchResult({
              isLoading: false,
              data: researchData,
              error: null,
            });
          })
          .catch((err) => {
            console.error("Full Research Error:", err);
            setResearchResult({
              isLoading: false,
              data: null,
              error: `情報のリサーチ中にエラーが発生しました:\n${formatError(err)}`,
            });
          });
      };

      if (delayMs > 0) {
        setTimeout(run, delayMs);
      } else {
        run();
      }
    },
    []
  );

  const resetResearch = useCallback(() => {
    setResearchResult(initialState);
  }, []);

  return { researchResult, executeResearch, resetResearch };
}
