import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Box, Flex, Button } from "@radix-ui/themes";

interface CameraProps {
  onCapture: (imageData: string) => void;
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
        setCapturedImage(imageSrc);
        setIsCapturing(false);
        onCapture(imageSrc);
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
        onCapture(imageDataUrl);
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
            <Button onClick={capture} size="3" highContrast color="green">
              撮影
            </Button>
            <Button
              onClick={triggerFileUpload}
              size="3"
              highContrast
              color="blue"
            >
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
            <Button onClick={reset} size="3" color="red">
              リセット
            </Button>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default Camera;
