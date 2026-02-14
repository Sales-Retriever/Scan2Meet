import React from "react";
import { DataList, TextField, Flex, Link, Button } from "@radix-ui/themes";
import { SearchIcon } from "lucide-react";

interface EditableFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  linkHref?: string;
  searchQuery?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  isEditing,
  onChange,
  linkHref,
  searchQuery,
}) => {
  const displayContent = () => {
    if (linkHref && value) {
      return (
        <Link
          href={linkHref}
          target={linkHref.startsWith("http") ? "_blank" : undefined}
          rel={linkHref.startsWith("http") ? "noopener noreferrer" : undefined}
          size="2"
        >
          {value}
        </Link>
      );
    }
    if (searchQuery) {
      return (
        <Flex gap="3" align="center">
          {value}
          {value && (
            <Button
              onClick={() =>
                window.open(
                  `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`,
                  "_blank"
                )
              }
              size="2"
              color="gray"
              variant="ghost"
            >
              <SearchIcon className="w-4 h-4" />
            </Button>
          )}
        </Flex>
      );
    }
    return value;
  };

  return (
    <DataList.Item>
      <DataList.Label minWidth="88px">{label}</DataList.Label>
      <DataList.Value>
        {isEditing ? (
          <TextField.Root
            size="2"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          displayContent()
        )}
      </DataList.Value>
    </DataList.Item>
  );
};

export default EditableField;
