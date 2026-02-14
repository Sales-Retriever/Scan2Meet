import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Card,
  Button,
  Separator,
  DataList,
  IconButton,
} from "@radix-ui/themes";
import ReactMarkdown from "react-markdown";
import {
  CalendarIcon,
  CameraIcon,
  Facebook,
  SearchIcon,
  SparklesIcon,
  Edit2Icon,
  CheckIcon,
  Loader,
} from "lucide-react";
import { useSchedulingLinks } from "../hooks/useSchedulingLinks";
import { getFullName } from "../hooks/useResearch";
import { buildSchedulingUrl } from "../utils/schedulingUrl";
import EditableField from "./EditableField";
import type { BusinessCardData, ResearchResultState } from "../types";

interface BusinessCardInfoProps {
  data: BusinessCardData | null;
  isLoading: boolean;
  error: string | null;
  researchResult: ResearchResultState;
  onResearch: () => void;
  onUpdate: (updatedData: BusinessCardData) => void;
  onReset: () => void;
}

const BusinessCardInfo: React.FC<BusinessCardInfoProps> = ({
  data,
  isLoading,
  error,
  researchResult,
  onResearch,
  onUpdate,
  onReset,
}) => {
  const { links: schedulingLinks } = useSchedulingLinks();
  const [isEditing, setIsEditing] = useState(false);
  const [editingData, setEditingData] = useState<BusinessCardData | null>(null);

  React.useEffect(() => {
    if (data) {
      setEditingData(data);
    }
  }, [data]);

  const handleSave = () => {
    if (editingData) {
      onUpdate(editingData);
      setIsEditing(false);
    }
  };

  const handleChange = (field: keyof BusinessCardData, value: string) => {
    if (editingData) {
      setEditingData({ ...editingData, [field]: value });
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

  if (!data || !editingData) {
    return null;
  }

  const fullName = getFullName(editingData);

  return (
    <Box width="100%">
      <Box width="100%" maxWidth="500px" mx="auto" my="4">
        <Card size="2">
          <Box mb="4">
            <Flex gap="3" mt="5" align="center" wrap="wrap">
              <Heading size="5" mb="1">
                {fullName || "名前なし"}
              </Heading>

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
                    window.open(
                      `https://www.facebook.com/search_results/?q=${encodeURIComponent(fullName)}`,
                      "_blank"
                    );
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
                    window.open(
                      `https://www.google.com/search?q=${encodeURIComponent(fullName)}`,
                      "_blank"
                    );
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
            <EditableField
              label="姓"
              value={editingData.lastName}
              isEditing={isEditing}
              onChange={(v) => handleChange("lastName", v)}
            />
            <EditableField
              label="名"
              value={editingData.firstName}
              isEditing={isEditing}
              onChange={(v) => handleChange("firstName", v)}
            />
            <EditableField
              label="役職"
              value={editingData.position}
              isEditing={isEditing}
              onChange={(v) => handleChange("position", v)}
            />
            <EditableField
              label="部署名"
              value={editingData.department}
              isEditing={isEditing}
              onChange={(v) => handleChange("department", v)}
              searchQuery={
                editingData.department
                  ? `${editingData.company} ${editingData.department}`
                  : undefined
              }
            />
            <EditableField
              label="会社名"
              value={editingData.company}
              isEditing={isEditing}
              onChange={(v) => handleChange("company", v)}
              searchQuery={editingData.company || undefined}
            />
            <EditableField
              label="電話番号"
              value={editingData.phone}
              isEditing={isEditing}
              onChange={(v) => handleChange("phone", v)}
              linkHref={editingData.phone ? `tel:${editingData.phone}` : undefined}
            />
            <EditableField
              label="メール"
              value={editingData.email}
              isEditing={isEditing}
              onChange={(v) => handleChange("email", v)}
              linkHref={editingData.email ? `mailto:${editingData.email}` : undefined}
            />
            <EditableField
              label="住所"
              value={editingData.address}
              isEditing={isEditing}
              onChange={(v) => handleChange("address", v)}
            />
            <EditableField
              label="ウェブサイト"
              value={editingData.website}
              isEditing={isEditing}
              onChange={(v) => handleChange("website", v)}
              linkHref={
                editingData.website
                  ? editingData.website.startsWith("http")
                    ? editingData.website
                    : `https://${editingData.website}`
                  : undefined
              }
            />
          </DataList.Root>

          <Flex gap="3" mt="5" justify="center" wrap="wrap">
            {schedulingLinks.map((link) => (
              <Button
                key={link.id}
                onClick={() => {
                  const url = buildSchedulingUrl(link.url, editingData, fullName);
                  window.open(url, "_blank");
                }}
                size="2"
                color="orange"
              >
                <CalendarIcon className="w-4 h-4" />
                {link.label}
              </Button>
            ))}

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

            <Button
              onClick={onReset}
              size="2"
              color="gray"
              variant="outline"
            >
              <CameraIcon className="w-4 h-4" />
              別の名刺を撮影
            </Button>
          </Flex>
        </Card>
      </Box>

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
