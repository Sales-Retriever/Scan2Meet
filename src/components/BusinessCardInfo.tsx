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
import { researchCompany } from "../services/gemini";

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
  const [companyResearch, setCompanyResearch] = useState<{
    isLoading: boolean;
    data: { summary: string | undefined; sources: string | null } | null;
    error: string | null;
  }>({
    isLoading: false,
    data: null,
    error: null,
  });

  // 会社名でリサーチする関数
  const handleCompanyResearch = async () => {
    if (!data?.company) return;

    setCompanyResearch({
      isLoading: true,
      data: null,
      error: null,
    });

    try {
      const result = await researchCompany(data.company);
      setCompanyResearch({
        isLoading: false,
        data: result,
        error: null,
      });
    } catch (err) {
      console.error("会社リサーチエラー:", err);
      setCompanyResearch({
        isLoading: false,
        data: null,
        error: "会社情報の取得中にエラーが発生しました。",
      });
    }
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

  return (
    <Box width="100%">
      <Box width="100%" maxWidth="500px" mx="auto" my="4">
        <Card size="2">
          <Box mb="4">
            <Heading size="5" mb="1">
              {data.lastName && data.firstName
                ? `${data.lastName} ${data.firstName}`
                : data.lastName || data.firstName || "名前なし"}
            </Heading>
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
                <DataList.Value>{data.department}</DataList.Value>
              </DataList.Item>
            )}

            {data.company && (
              <DataList.Item>
                <DataList.Label minWidth="88px">会社名</DataList.Label>
                <DataList.Value>{data.company}</DataList.Value>
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
            <Button
              onClick={() => {
                // クエリパラメータを構築
                const params = new URLSearchParams();

                // 環境変数からクエリパラメータ名を取得
                const lastNameParam =
                  import.meta.env.VITE_QUERY_PARAM_LAST_NAME || "lastName";
                const firstNameParam =
                  import.meta.env.VITE_QUERY_PARAM_FIRST_NAME || "firstName";
                const departmentParam =
                  import.meta.env.VITE_QUERY_PARAM_DEPARTMENT || "department";
                const companyParam =
                  import.meta.env.VITE_QUERY_PARAM_COMPANY || "company";
                const emailParam =
                  import.meta.env.VITE_QUERY_PARAM_EMAIL || "email";

                // 値が存在する場合のみパラメータを追加
                if (data.lastName) params.append(lastNameParam, data.lastName);
                if (data.firstName)
                  params.append(firstNameParam, data.firstName);
                if (data.department)
                  params.append(departmentParam, data.department);
                if (data.company) params.append(companyParam, data.company);
                if (data.email) params.append(emailParam, data.email);

                // URLを構築
                const baseUrl = import.meta.env.VITE_SCHEDULE_TOOL_URL;
                const url = params.toString()
                  ? `${baseUrl}${
                      baseUrl.includes("?") ? "&" : "?"
                    }${params.toString()}`
                  : baseUrl;

                // 新しいタブでURLを開く
                window.open(url, "_blank");
              }}
              size="2"
              color="orange"
            >
              日程調整
            </Button>

            <Button
              onClick={() => {
                // 名前を取得
                const fullName =
                  data.lastName && data.firstName
                    ? `${data.lastName} ${data.firstName}`
                    : data.lastName || data.firstName || "";

                if (fullName) {
                  // Facebookの検索URLを構築
                  const searchUrl = `https://www.facebook.com/search/people/?q=${encodeURIComponent(
                    fullName
                  )}`;

                  // 新しいタブでURLを開く
                  window.open(searchUrl, "_blank");
                }
              }}
              size="2"
              color="indigo"
            >
              Facebookで検索
            </Button>

            {data.company && (
              <Button
                onClick={handleCompanyResearch}
                disabled={companyResearch.isLoading}
                size="2"
                color="iris"
              >
                {companyResearch.isLoading ? "リサーチ中..." : "会社をリサーチ"}
              </Button>
            )}
          </Flex>
        </Card>
      </Box>

      {companyResearch.isLoading && (
        <Box width="100%" maxWidth="500px" mx="auto" my="3">
          <Card size="2">
            <Text size="2" color="blue" align="center">
              会社情報をリサーチ中...
            </Text>
          </Card>
        </Box>
      )}

      {companyResearch.error && (
        <Box width="100%" maxWidth="500px" mx="auto" my="3">
          <Card size="2">
            <Text size="2" color="red" align="center">
              {companyResearch.error}
            </Text>
          </Card>
        </Box>
      )}

      {companyResearch.data && (
        <Box width="100%" maxWidth="500px" mx="auto" my="3">
          <Card size="2">
            <Heading size="4" mb="3" color="iris">
              会社情報
            </Heading>
            <Box>
              <div className="markdown-content">
                <ReactMarkdown>
                  {companyResearch.data.summary || ""}
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
