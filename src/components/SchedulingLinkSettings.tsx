import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  TextField,
  IconButton,
  Button,
  Dialog,
  DropdownMenu,
} from "@radix-ui/themes";
import {
  CalendarIcon,
  PlusIcon,
  Trash2Icon,
  Edit2Icon,
  CheckIcon,
  XIcon,
  MoreVerticalIcon,
} from "lucide-react";
import {
  useSchedulingLinks,
  type SchedulingLink,
} from "../hooks/useSchedulingLinks";

interface SchedulingLinkSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SchedulingLinkSettings: React.FC<SchedulingLinkSettingsProps> = ({
  open,
  onOpenChange,
}) => {
  const { links, addLink, updateLink, removeLink, maxLinks } =
    useSchedulingLinks();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const startEdit = (link: SchedulingLink) => {
    setEditingId(link.id);
    setEditLabel(link.label);
    setEditUrl(link.url);
    setIsAdding(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditLabel("");
    setEditUrl("");
    setIsAdding(false);
  };

  const saveEdit = () => {
    if (!editUrl.trim()) return;
    if (isAdding) {
      addLink(editLabel.trim() || "日程調整", editUrl.trim());
    } else if (editingId) {
      updateLink(editingId, editLabel.trim() || "日程調整", editUrl.trim());
    }
    cancelEdit();
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditLabel("");
    setEditUrl("");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content maxWidth="400px">
        <Dialog.Title>
          <Flex align="center" gap="2">
            <CalendarIcon size={18} />
            日程調整リンク設定
          </Flex>
        </Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          HubSpotの日程調整リンクを登録すると、名刺スキャン後にワンタップで日程調整ページを開けます
        </Dialog.Description>

        {/* 登録済みリンク一覧 */}
        {links.map((link) => (
          <Box key={link.id} mb="2">
            {editingId === link.id && !isAdding ? (
              <LinkForm
                label={editLabel}
                url={editUrl}
                onLabelChange={setEditLabel}
                onUrlChange={setEditUrl}
                onSave={saveEdit}
                onCancel={cancelEdit}
              />
            ) : (
              <Flex
                align="center"
                justify="between"
                py="2"
                px="3"
                style={{
                  backgroundColor: "var(--gray-2)",
                  borderRadius: "8px",
                }}
              >
                <Flex align="center" gap="2" style={{ minWidth: 0, flex: 1 }}>
                  <CalendarIcon
                    size={16}
                    color="var(--orange-9)"
                    style={{ flexShrink: 0 }}
                  />
                  <Text
                    size="3"
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {link.label}
                  </Text>
                </Flex>
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <IconButton size="2" variant="ghost" color="gray">
                      <MoreVerticalIcon size={18} />
                    </IconButton>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item onClick={() => startEdit(link)}>
                      <Edit2Icon size={14} />
                      編集
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item
                      color="red"
                      onClick={() => removeLink(link.id)}
                    >
                      <Trash2Icon size={14} />
                      削除
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Flex>
            )}
          </Box>
        ))}

        {/* 追加フォーム */}
        {isAdding && (
          <Box mb="2">
            <LinkForm
              label={editLabel}
              url={editUrl}
              onLabelChange={setEditLabel}
              onUrlChange={setEditUrl}
              onSave={saveEdit}
              onCancel={cancelEdit}
            />
          </Box>
        )}

        {/* 追加ボタン */}
        {!isAdding && links.length < maxLinks && (
          <Button
            variant="soft"
            color="iris"
            size="3"
            onClick={startAdd}
            style={{ width: "100%" }}
          >
            <PlusIcon size={16} />
            リンクを追加
          </Button>
        )}

        <Flex justify="end" mt="4">
          <Dialog.Close>
            <Button variant="soft" color="gray" size="3">
              閉じる
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

// 編集/追加フォーム
const LinkForm: React.FC<{
  label: string;
  url: string;
  onLabelChange: (v: string) => void;
  onUrlChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}> = ({ label, url, onLabelChange, onUrlChange, onSave, onCancel }) => (
  <Flex direction="column" gap="3">
    <TextField.Root
      size="3"
      placeholder="表示名（例: 30分ミーティング）"
      value={label}
      onChange={(e) => onLabelChange(e.target.value)}
    />
    <TextField.Root
      size="3"
      placeholder="URL（https://...）"
      value={url}
      onChange={(e) => onUrlChange(e.target.value)}
    />
    <Flex gap="3" justify="end">
      <IconButton size="3" variant="soft" color="gray" onClick={onCancel}>
        <XIcon size={18} />
      </IconButton>
      <IconButton
        size="3"
        variant="soft"
        color="green"
        onClick={onSave}
        disabled={!url.trim()}
      >
        <CheckIcon size={18} />
      </IconButton>
    </Flex>
  </Flex>
);

export default SchedulingLinkSettings;
