import React, { useRef, useState, useCallback } from "react";
// react-webcam の代わりに react-camera-pro をインポート
import { Camera as ReactCameraPro } from "react-camera-pro";
import { Box, Flex, Button } from "@radix-ui/themes";
import { CameraIcon, ImageIcon, Loader, RefreshCwIcon } from "lucide-react";

// Base64文字列をFileオブジェクトに変換するヘルパー関数 (変更なし)
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
  isLoading?: boolean; // ローディング状態を追加
}

// react-camera-pro の Camera コンポーネントのメソッドを定義するインターフェース
interface CameraMethods {
  takePhoto: () => string;
  switchCamera: () => "user" | "environment";
  getNumberOfCameras: () => number;
}

// コンポーネント名を Camera から CameraComponent に変更 (react-camera-pro との衝突回避)
const CameraComponent: React.FC<CameraProps> = ({
  onCapture,
  onReset,
  isLoading = false,
}) => {
  // react-camera-pro 用の ref を作成し、型を CameraMethods に指定
  const cameraRef = useRef<CameraMethods>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  // isCapturing の代わりに capturedImage の有無で表示を切り替える
  const fileInputRef = useRef<HTMLInputElement>(null);

  // カメラで撮影する関数 (react-camera-pro を使用)
  const capture = useCallback(() => {
    // cameraRef.current が null でないこと、takePhoto メソッドが存在することを確認
    if (
      cameraRef.current &&
      typeof cameraRef.current.takePhoto === "function"
    ) {
      const imageSrc = cameraRef.current.takePhoto();
      if (imageSrc) {
        const imageFile = dataURLtoFile(imageSrc, "camera-pro-capture.jpg");
        if (imageFile) {
          setCapturedImage(imageSrc);
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
  }, [cameraRef, onCapture]);

  // 画像をリセットする関数 (変更なし)
  const reset = useCallback(() => {
    setCapturedImage(null);
    onReset();
  }, [onReset]);

  // ファイルをアップロードする関数 (変更なし)
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        setCapturedImage(imageDataUrl);
        onCapture(imageDataUrl, file);
      };
      reader.readAsDataURL(file);
    }
  };

  // ファイルアップロードボタンをクリックする関数 (変更なし)
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box width="100%" maxWidth="500px" mx="auto" height="100%">
      {/* capturedImage の有無で表示を切り替え */}
      {!capturedImage ? (
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
              {/* react-camera-pro の Camera コンポーネントを使用 */}
              <ReactCameraPro
                ref={cameraRef}
                facingMode="environment" // 背面カメラをデフォルトに
                aspectRatio={9 / 14} // アスペクト比をスマホの縦長に合わせて変更
                errorMessages={{
                  // エラーメッセージをカスタマイズ (任意)
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
            {/* カメラ画面に撮影ボタンをオーバーレイ */}
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
                  position: "relative",
                }}
              >
                <CameraIcon size={24} />
              </Button>
            </Flex>
          </Box>
          <Flex gap="4" mt="" justify="center" width="100%">
            <Button
              onClick={triggerFileUpload}
              size="3"
              color="iris"
              variant="outline"
              disabled={isLoading}
              style={{ width: "100%" }}
            >
              {isLoading ? (
                "処理中..."
              ) : (
                <>
                  <ImageIcon />
                  画像をアップロード
                </>
              )}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: "none" }}
            />
          </Flex>
        </Flex>
      ) : (
        <>
          <Box width="100%" style={{ position: "relative" }}>
            {/* プレビュー表示 */}
            <div style={{ borderRadius: "8px", overflow: "hidden" }}>
              <img
                src={capturedImage}
                alt="Captured"
                width="100%"
                height="auto"
              />
            </div>
            {/* ローディングインジケーター */}
            {isLoading && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Loader className="animate-spin" size={32} />
              </div>
            )}
            {/* リセットボタンをオーバーレイ */}
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
                onClick={reset}
                size="3"
                color="gray"
                variant="outline"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(4px)",
                }}
              >
                <RefreshCwIcon />
                リセット
              </Button>
            </Flex>
          </Box>
        </>
      )}
    </Box>
  );
};

// エクスポート名を CameraComponent に変更
export default CameraComponent;
