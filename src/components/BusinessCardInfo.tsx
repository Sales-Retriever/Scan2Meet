import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  Link,
  Button,
  Separator,
  DataList,
} from "@radix-ui/themes";
import ReactMarkdown from "react-markdown";
// researchAll をインポート
import { researchAll } from "../services/gemini";
import { CalendarIcon, Facebook, SearchIcon, SparklesIcon } from "lucide-react";

// 名刺情報の型定義
export interface BusinessCardData {
  lastName: string;
  firstName: string;
  position: string;
  department: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  website: string;
}

interface BusinessCardInfoProps {
  data: BusinessCardData | null;
  isLoading: boolean;
  error: string | null;
}

const BusinessCardInfo: React.FC<BusinessCardInfoProps> = ({
  data,
  isLoading,
  error,
}) => {
  // 統合されたリサーチ結果用の state
  const [researchResult, setResearchResult] = useState<{
    isLoading: boolean;
    data: { summary: string | undefined; sources: string | null } | null;
    error: string | null;
  }>({
    isLoading: false,
    data: null,
    error: null,
  });

  // まとめてリサーチする関数
  const handleResearchAll = async () => {
    // data, company, fullName の存在を確認 (department のチェックを削除)
    if (!data?.company || !fullName) return;

    setResearchResult({
      isLoading: true,
      data: null,
      error: null,
    });

    try {
      const result = await researchAll(data.company, fullName, data.department);
      setResearchResult({
        isLoading: false,
        data: result,
        error: null,
      });
    } catch (err) {
      // より詳細なエラーログを出力
      console.error("Full Research Error:", err); // 完全なエラーオブジェクトをログに出力
      let detailedErrorMessage = "不明なエラーが発生しました。";
      if (err instanceof Error) {
        detailedErrorMessage = `${err.message}${
          err.stack ? `\nStack: ${err.stack}` : ""
        }`;
      } else {
        detailedErrorMessage = String(err);
      }
      setResearchResult({
        isLoading: false,
        data: null,
        error: `情報のリサーチ中にエラーが発生しました:\n${detailedErrorMessage}`, // UIに詳細なエラーを表示
      });
    }
  };

  // Helper function to build scheduling URL with query parameters
  const buildSchedulingUrl = (baseUrl: string): string => {
    if (!data) return baseUrl; // Return base URL if no data

    const params = new URLSearchParams();
    // Get param names from env, with defaults
    const lastNameParam =
      import.meta.env.VITE_QUERY_PARAM_LAST_NAME || "lastName";
    const firstNameParam =
      import.meta.env.VITE_QUERY_PARAM_FIRST_NAME || "firstName";
    const fullNameParam =
      import.meta.env.VITE_QUERY_PARAM_FULL_NAME || "fullName";
    const departmentParam =
      import.meta.env.VITE_QUERY_PARAM_DEPARTMENT || "department";
    const companyParam = import.meta.env.VITE_QUERY_PARAM_COMPANY || "company";
    const emailParam = import.meta.env.VITE_QUERY_PARAM_EMAIL || "email";
    const phoneParam = import.meta.env.VITE_QUERY_PARAM_PHONE || "phone"; // 電話番号パラメータ名を取得

    // Append params if data exists
    if (data.lastName) params.append(lastNameParam, data.lastName);
    if (data.firstName) params.append(firstNameParam, data.firstName);
    // Use the fullName variable already defined in the component scope
    if (fullName) params.append(fullNameParam, fullName);
    if (data.department) params.append(departmentParam, data.department);
    if (data.company) params.append(companyParam, data.company);
    if (data.email) params.append(emailParam, data.email);
    if (data.phone) params.append(phoneParam, data.phone); // 電話番号を追加

    // Construct final URL
    return params.toString()
      ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${params.toString()}`
      : baseUrl;
  };

  if (isLoading) {
    return (
      <Box width="100%" maxWidth="500px" mx="auto" my="4">
        <Card size="2">
          <Text size="3" color="gray" align="center">
            名刺を解析中...
          </Text>
        </Card>
      </Box>
    );
  }

  if (error) {
    return (
      <Box width="100%" maxWidth="500px" mx="auto" my="4">
        <Card size="2">
          <Text size="3" color="red" align="center">
            {error}
          </Text>
        </Card>
      </Box>
    );
  }

  if (!data) {
    return null;
  }
  const fullName =
    data.lastName && data.firstName
      ? `${data.lastName} ${data.firstName}`
      : data.lastName || data.firstName || "";

  return (
    <Box width="100%">
      <Box width="100%" maxWidth="500px" mx="auto" my="4">
        <Card size="2">
          <Box mb="4">
            <Flex gap="3" mt="5" align="center" wrap="wrap">
              <Heading size="5" mb="1">
                {data.lastName && data.firstName
                  ? `${data.lastName} ${data.firstName}`
                  : data.lastName || data.firstName || "名前なし"}
              </Heading>
              <Button
                onClick={() => {
                  if (fullName) {
                    const searchUrl = `https://www.facebook.com/search_results/?q=${encodeURIComponent(
                      fullName
                    )}`;

                    window.open(searchUrl, "_blank");
                  }
                }}
                size="2"
                color="indigo"
                variant="ghost"
              >
                <Facebook className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => {
                  if (fullName) {
                    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
                      fullName
                    )}`;

                    window.open(searchUrl, "_blank");
                  }
                }}
                size="2"
                color="gray"
                variant="ghost"
              >
                <SearchIcon className="w-4 h-4" />
              </Button>
            </Flex>
            {data.position && (
              <Text size="2" color="gray">
                {data.position}
              </Text>
            )}
            <Separator size="4" my="3" />
          </Box>

          <DataList.Root>
            {data.lastName && (
              <DataList.Item>
                <DataList.Label minWidth="88px">姓</DataList.Label>
                <DataList.Value>{data.lastName}</DataList.Value>
              </DataList.Item>
            )}

            {data.firstName && (
              <DataList.Item>
                <DataList.Label minWidth="88px">名</DataList.Label>
                <DataList.Value>{data.firstName}</DataList.Value>
              </DataList.Item>
            )}

            {data.department && (
              <DataList.Item>
                <DataList.Label minWidth="88px">部署名</DataList.Label>
                <DataList.Value>
                  <Flex gap="3" align="center">
                    {data.department}
                    <Button
                      onClick={() => {
                        if (fullName) {
                          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
                            `${data.company} ${data.department}`
                          )}`;

                          window.open(searchUrl, "_blank");
                        }
                      }}
                      size="2"
                      color="gray"
                      variant="ghost"
                    >
                      <SearchIcon className="w-4 h-4" />
                    </Button>
                  </Flex>
                </DataList.Value>
              </DataList.Item>
            )}

            {data.company && (
              <DataList.Item>
                <DataList.Label minWidth="88px">会社名</DataList.Label>
                <DataList.Value>
                  <Flex gap="3" align="center">
                    {data.company}
                    <Button
                      onClick={() => {
                        if (fullName) {
                          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
                            data.company
                          )}`;

                          window.open(searchUrl, "_blank");
                        }
                      }}
                      size="2"
                      color="gray"
                      variant="ghost"
                    >
                      <SearchIcon className="w-4 h-4" />
                    </Button>
                  </Flex>
                </DataList.Value>
              </DataList.Item>
            )}

            {data.phone && (
              <DataList.Item>
                <DataList.Label minWidth="88px">電話番号</DataList.Label>
                <DataList.Value>
                  <Link href={`tel:${data.phone}`} size="2">
                    {data.phone}
                  </Link>
                </DataList.Value>
              </DataList.Item>
            )}

            {data.email && (
              <DataList.Item>
                <DataList.Label minWidth="88px">メール</DataList.Label>
                <DataList.Value>
                  <Link href={`mailto:${data.email}`} size="2">
                    {data.email}
                  </Link>
                </DataList.Value>
              </DataList.Item>
            )}

            {data.address && (
              <DataList.Item>
                <DataList.Label minWidth="88px">住所</DataList.Label>
                <DataList.Value>{data.address}</DataList.Value>
              </DataList.Item>
            )}

            {data.website && (
              <DataList.Item>
                <DataList.Label minWidth="88px">ウェブサイト</DataList.Label>
                <DataList.Value>
                  <Link
                    href={
                      data.website.startsWith("http")
                        ? data.website
                        : `https://${data.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    size="2"
                  >
                    {data.website}
                  </Link>
                </DataList.Value>
              </DataList.Item>
            )}
          </DataList.Root>

          <Flex gap="3" mt="5" justify="center" wrap="wrap">
            {/* Scheduling Links */}
            {/* Scheduling Links - Add checks for undefined */}
            {import.meta.env.VITE_SCHEDULING_LINK_1 && (
              <Button
                onClick={() => {
                  const baseUrl = import.meta.env.VITE_SCHEDULING_LINK_1;
                  if (baseUrl) {
                    // Check if baseUrl is defined
                    const url = buildSchedulingUrl(baseUrl);
                    window.open(url, "_blank");
                  }
                }}
                size="2"
                color="orange"
              >
                <CalendarIcon className="w-4 h-4" />
                日程調整 1
              </Button>
            )}
            {import.meta.env.VITE_SCHEDULING_LINK_2 && (
              <Button
                onClick={() => {
                  const baseUrl = import.meta.env.VITE_SCHEDULING_LINK_2;
                  if (baseUrl) {
                    // Check if baseUrl is defined
                    const url = buildSchedulingUrl(baseUrl);
                    window.open(url, "_blank");
                  }
                }}
                size="2"
                color="orange"
              >
                <CalendarIcon className="w-4 h-4" />
                日程調整 2
              </Button>
            )}
            {import.meta.env.VITE_SCHEDULING_LINK_3 && (
              <Button
                onClick={() => {
                  const baseUrl = import.meta.env.VITE_SCHEDULING_LINK_3;
                  if (baseUrl) {
                    // Check if baseUrl is defined
                    const url = buildSchedulingUrl(baseUrl);
                    window.open(url, "_blank");
                  }
                }}
                size="2"
                color="orange"
              >
                <CalendarIcon className="w-4 h-4" />
                日程調整 3
              </Button>
            )}

            {/* Combined Research Button (department のチェックを削除) */}
            {data.company && fullName && (
              <Button
                onClick={handleResearchAll}
                disabled={researchResult.isLoading}
                size="2"
              >
                <SparklesIcon className="w-4 h-4" />
                {researchResult.isLoading ? "リサーチ中..." : "AIリサーチ"}
              </Button>
            )}
          </Flex>
        </Card>
      </Box>

      {/* Display Combined Research Result */}
      {researchResult.isLoading && (
        <Box width="100%" maxWidth="500px" mx="auto" my="3">
          <Card size="2">
            <Text size="2" color="blue" align="center">
              情報をリサーチ中...
            </Text>
          </Card>
        </Box>
      )}

      {researchResult.error && (
        <Box width="100%" maxWidth="500px" mx="auto" my="3">
          <Card size="2">
            <Text size="2" color="red" align="center">
              {researchResult.error}
            </Text>
          </Card>
        </Box>
      )}

      {researchResult.data && (
        <Box width="100%" maxWidth="500px" mx="auto" my="3">
          <Card size="2">
            <Heading size="4" mb="3" color="purple">
              リサーチ結果
            </Heading>
            <Box>
              <div className="m-2">
                <ReactMarkdown>
                  {researchResult.data.summary || ""}
                </ReactMarkdown>
              </div>
            </Box>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default BusinessCardInfo;
