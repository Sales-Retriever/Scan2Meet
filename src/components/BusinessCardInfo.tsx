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
  TextField,
  IconButton,
} from "@radix-ui/themes";
import ReactMarkdown from "react-markdown";
import {
  CalendarIcon,
  Facebook,
  SearchIcon,
  SparklesIcon,
  Edit2Icon,
  CheckIcon,
  Loader,
} from "lucide-react";
import { useSchedulingLinks } from "../hooks/useSchedulingLinks";

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
  researchResult: {
    isLoading: boolean;
    data: { summary: string | undefined; sources: string | null } | null;
    error: string | null;
  };
  onResearch: () => void;
  onUpdate: (updatedData: BusinessCardData) => void; // 編集内容を親コンポーネントに伝えるコールバック
}

const BusinessCardInfo: React.FC<BusinessCardInfoProps> = ({
  data,
  isLoading,
  error,
  researchResult,
  onResearch,
  onUpdate,
}) => {
  const { links: schedulingLinks } = useSchedulingLinks();
  // 編集モードの状態
  const [isEditing, setIsEditing] = useState(false);
  // 編集中のデータを保持する状態
  const [editingData, setEditingData] = useState<BusinessCardData | null>(null);

  // データが変更されたときに編集中のデータを初期化
  React.useEffect(() => {
    if (data) {
      setEditingData(data);
    }
  }, [data]);

  // 編集内容を保存する関数
  const handleSave = () => {
    if (editingData) {
      onUpdate(editingData);
      setIsEditing(false);
    }
  };

  // 入力フィールドの変更を処理する関数
  const handleChange = (field: keyof BusinessCardData, value: string) => {
    if (editingData) {
      setEditingData({
        ...editingData,
        [field]: value,
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

  if (!data || !editingData) {
    return null;
  }
  const fullName =
    editingData.lastName && editingData.firstName
      ? `${editingData.lastName} ${editingData.firstName}`
      : editingData.lastName || editingData.firstName || "";

  return (
    <Box width="100%">
      <Box width="100%" maxWidth="500px" mx="auto" my="4">
        <Card size="2">
          <Box mb="4">
            <Flex gap="3" mt="5" align="center" wrap="wrap">
              <Heading size="5" mb="1">
                {editingData.lastName && editingData.firstName
                  ? `${editingData.lastName} ${editingData.firstName}`
                  : editingData.lastName || editingData.firstName || "名前なし"}
              </Heading>

              {/* 編集モード切り替えボタン */}
              <IconButton
                size="2"
                variant="ghost"
                color={isEditing ? "green" : "gray"}
                onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              >
                {isEditing ? <CheckIcon /> : <Edit2Icon />}
              </IconButton>
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
            {editingData.position && (
              <Text size="2" color="gray">
                {editingData.position}
              </Text>
            )}
            <Separator size="4" my="3" />
          </Box>

          <DataList.Root>
            <DataList.Item>
              <DataList.Label minWidth="88px">姓</DataList.Label>
              <DataList.Value>
                {isEditing ? (
                  <TextField.Root
                    size="2"
                    value={editingData.lastName}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                  />
                ) : (
                  editingData.lastName
                )}
              </DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label minWidth="88px">名</DataList.Label>
              <DataList.Value>
                {isEditing ? (
                  <TextField.Root
                    size="2"
                    value={editingData.firstName}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                  />
                ) : (
                  editingData.firstName
                )}
              </DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label minWidth="88px">役職</DataList.Label>
              <DataList.Value>
                {isEditing ? (
                  <TextField.Root
                    size="2"
                    value={editingData.position}
                    onChange={(e) => handleChange("position", e.target.value)}
                  />
                ) : (
                  editingData.position
                )}
              </DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label minWidth="88px">部署名</DataList.Label>
              <DataList.Value>
                {isEditing ? (
                  <TextField.Root
                    size="2"
                    value={editingData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                  />
                ) : (
                  <Flex gap="3" align="center">
                    {editingData.department}
                    {editingData.department && (
                      <Button
                        onClick={() => {
                          if (fullName) {
                            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
                              `${editingData.company} ${editingData.department}`
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
                    )}
                  </Flex>
                )}
              </DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label minWidth="88px">会社名</DataList.Label>
              <DataList.Value>
                {isEditing ? (
                  <TextField.Root
                    size="2"
                    value={editingData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                  />
                ) : (
                  <Flex gap="3" align="center">
                    {editingData.company}
                    {editingData.company && (
                      <Button
                        onClick={() => {
                          if (fullName) {
                            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(
                              editingData.company
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
                    )}
                  </Flex>
                )}
              </DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label minWidth="88px">電話番号</DataList.Label>
              <DataList.Value>
                {isEditing ? (
                  <TextField.Root
                    size="2"
                    value={editingData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                ) : (
                  editingData.phone && (
                    <Link href={`tel:${editingData.phone}`} size="2">
                      {editingData.phone}
                    </Link>
                  )
                )}
              </DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label minWidth="88px">メール</DataList.Label>
              <DataList.Value>
                {isEditing ? (
                  <TextField.Root
                    size="2"
                    value={editingData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                ) : (
                  editingData.email && (
                    <Link href={`mailto:${editingData.email}`} size="2">
                      {editingData.email}
                    </Link>
                  )
                )}
              </DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label minWidth="88px">住所</DataList.Label>
              <DataList.Value>
                {isEditing ? (
                  <TextField.Root
                    size="2"
                    value={editingData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                  />
                ) : (
                  editingData.address
                )}
              </DataList.Value>
            </DataList.Item>

            <DataList.Item>
              <DataList.Label minWidth="88px">ウェブサイト</DataList.Label>
              <DataList.Value>
                {isEditing ? (
                  <TextField.Root
                    size="2"
                    value={editingData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                  />
                ) : (
                  editingData.website && (
                    <Link
                      href={
                        editingData.website.startsWith("http")
                          ? editingData.website
                          : `https://${editingData.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      size="2"
                    >
                      {editingData.website}
                    </Link>
                  )
                )}
              </DataList.Value>
            </DataList.Item>
          </DataList.Root>

          <Flex gap="3" mt="5" justify="center" wrap="wrap">
            {/* Scheduling Links (LocalStorage) */}
            {schedulingLinks.map((link) => (
              <Button
                key={link.id}
                onClick={() => {
                  const url = buildSchedulingUrl(link.url);
                  window.open(url, "_blank");
                }}
                size="2"
                color="orange"
              >
                <CalendarIcon className="w-4 h-4" />
                {link.label}
              </Button>
            ))}

            {/* Combined Research Button */}
            {editingData.company && fullName && (
              <Button
                onClick={onResearch}
                disabled={researchResult.isLoading}
                size="2"
              >
                {researchResult.isLoading ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <SparklesIcon className="w-4 h-4" />
                )}
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
            <Flex align="center" justify="center" gap="2">
              <Loader size={16} className="animate-spin" />
              <Text size="2" color="blue">
                情報をリサーチ中...
              </Text>
            </Flex>
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
            <Box style={{ overflowX: "auto" }}>
              <div style={{ paddingLeft: "1.5em", fontSize: "0.875rem" }}>
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
