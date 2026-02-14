import React, { useRef, useState, useCallback } from "react";
import { Camera as ReactCameraPro } from "react-camera-pro";
import { Box, Flex, Button } from "@radix-ui/themes";
import { CameraIcon, ImageIcon, SettingsIcon } from "lucide-react";
import SchedulingLinkSettings from "./SchedulingLinkSettings";
import { useSchedulingLinks } from "../hooks/useSchedulingLinks";

function dataURLtoFile(dataurl: string, filename: string): File | null {
  const arr = dataurl.split(",");
  if (arr.length < 2) return null;
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) return null;
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

interface CameraProps {
  onCapture: (imageData: string, imageFile: File) => void;
  onReset: () => void;
  isLoading?: boolean;
}

interface CameraMethods {
  takePhoto: () => string;
  switchCamera: () => "user" | "environment";
  getNumberOfCameras: () => number;
}

const CameraComponent: React.FC<CameraProps> = ({
  onCapture,
  onReset,
  isLoading = false,
}) => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { links } = useSchedulingLinks();
  const hasNoLinks = links.length === 0;
  const cameraRef = useRef<CameraMethods>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capture = useCallback(() => {
    if (
      cameraRef.current &&
      typeof cameraRef.current.takePhoto === "function"
    ) {
      const imageSrc = cameraRef.current.takePhoto();
      if (imageSrc) {
        const imageFile = dataURLtoFile(imageSrc, "camera-pro-capture.jpg");
        if (imageFile) {
          onReset();
          onCapture(imageSrc, imageFile);
        } else {
          console.error("Failed to convert camera capture to File object.");
        }
      }
    } else {
      console.error(
        "Camera ref is not available or takePhoto method is missing."
      );
    }
  }, [cameraRef, onCapture, onReset]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        onReset();
        onCapture(imageDataUrl, file);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box width="100%" maxWidth="500px" mx="auto" height="100%">
      <Flex
        direction="column"
        align="center"
        gap="4"
        width="100%"
        maxWidth="500px"
        height="100%"
        mx="auto"
        justify="between"
      >
        <Box width="100%" mb="" style={{ flex: 1, position: "relative" }}>
          <div style={{ borderRadius: "8px", overflow: "hidden" }}>
            <ReactCameraPro
              ref={cameraRef}
              facingMode="environment"
              aspectRatio={9 / 14}
              errorMessages={{
                noCameraAccessible:
                  "カメラにアクセスできません。接続を確認するか、別のブラウザをお試しください。",
                permissionDenied:
                  "カメラへのアクセス許可が拒否されました。ページを更新して許可してください。",
                switchCamera:
                  "利用可能なカメラが1台しかないため、切り替えできません。",
                canvas: "Canvasがサポートされていません。",
              }}
            />
          </div>
          {/* 撮影ボタン（中央下） */}
          <Flex
            style={{
              position: "absolute",
              bottom: "20px",
              left: 0,
              right: 0,
              justifyContent: "center",
            }}
          >
            <Button
              onClick={capture}
              size="3"
              color="iris"
              disabled={isLoading}
              style={{
                borderRadius: "50%",
                width: "60px",
                height: "60px",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CameraIcon size={24} />
            </Button>
          </Flex>
          {/* アップロード・設定ボタン（右上縦並び） */}
          <Flex
            direction="column"
            gap="2"
            style={{
              position: "absolute",
              top: "12px",
              right: "12px",
            }}
          >
            <Button
              onClick={triggerFileUpload}
              size="3"
              color="iris"
              disabled={isLoading}
              style={{
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(4px)",
                color: "var(--iris-9)",
              }}
            >
              <ImageIcon size={18} />
            </Button>
            <Button
              onClick={() => setSettingsOpen(true)}
              size="3"
              color="iris"
              style={{
                borderRadius: "50%",
                width: "44px",
                height: "44px",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: hasNoLinks
                  ? "var(--iris-9)"
                  : "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(4px)",
                color: hasNoLinks ? "white" : "var(--iris-9)",
              }}
            >
              <SettingsIcon size={18} />
            </Button>
          </Flex>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: "none" }}
          />
        </Box>
        <SchedulingLinkSettings
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      </Flex>
    </Box>
  );
};

export default CameraComponent;
