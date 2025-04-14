import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Box, Flex, Button } from "@radix-ui/themes";
import { CameraIcon, ImageIcon, RefreshCwIcon } from "lucide-react";

// Base64文字列をFileオブジェクトに変換するヘルパー関数
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
  // Fileオブジェクトも渡すように変更
  onCapture: (imageData: string, imageFile: File) => void;
  onReset: () => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture, onReset }) => {
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // カメラで撮影する関数
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Base64をFileオブジェクトに変換
        const imageFile = dataURLtoFile(imageSrc, "webcam-capture.jpg");
        if (imageFile) {
          setCapturedImage(imageSrc);
          setIsCapturing(false);
          // Fileオブジェクトも渡す
          onCapture(imageSrc, imageFile);
        } else {
          console.error("Failed to convert webcam capture to File object.");
          // 必要に応じてエラー処理を追加
        }
      }
    }
  }, [webcamRef, onCapture]);

  // 画像をリセットする関数
  const reset = useCallback(() => {
    setCapturedImage(null);
    setIsCapturing(true);
    onReset();
  }, [onReset]);

  // ファイルをアップロードする関数
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        setCapturedImage(imageDataUrl);
        setIsCapturing(false);
        // Fileオブジェクトも渡す
        onCapture(imageDataUrl, file);
      };
      reader.readAsDataURL(file);
    }
  };

  // ファイルアップロードボタンをクリックする関数
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box width="100%" maxWidth="500px" mx="auto">
      {isCapturing ? (
        <>
          <Box width="100%" mb="4">
            <div style={{ borderRadius: "8px", overflow: "hidden" }}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: "environment",
                }}
                width="100%"
                height="auto"
              />
            </div>
          </Box>
          <Flex gap="4" mt="4" justify="center" width="100%">
            <Button onClick={capture} size="3" color="iris">
              <CameraIcon />
              撮影
            </Button>
            <Button
              onClick={triggerFileUpload}
              size="3"
              color="iris"
              variant="outline"
            >
              <ImageIcon />
              画像をアップロード
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: "none" }}
            />
          </Flex>
        </>
      ) : (
        <>
          <Box width="100%" mb="4">
            {capturedImage && (
              <div style={{ borderRadius: "8px", overflow: "hidden" }}>
                <img
                  src={capturedImage}
                  alt="Captured"
                  width="100%"
                  height="auto"
                />
              </div>
            )}
          </Box>
          <Flex gap="4" mt="4" justify="center" width="100%">
            <Button onClick={reset} size="3" color="gray" variant="outline">
              <RefreshCwIcon />
              リセット
            </Button>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default Camera;
