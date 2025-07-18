import React, { useState, useRef } from "react";
import { FiPlus } from "react-icons/fi";

export const ChatInput = ({
  inputText,
  isLoading,
  onInputChange,
  onKeyPress,
  onSend,
  onFileUpload,
  imageBase64,
}: {
  inputText: string;
  isLoading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSend: () => void;
  onFileUpload: (base64: string) => void;
  imageBase64: string | null;
  setImageBase64: (value: string | null) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // ✅ Thêm ref

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setErrorMessage(null);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleImageFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleImageFile(file);
  };

  const handleImageFile = (file?: File) => {
    if (!file) {
      setErrorMessage("Không tìm thấy file hợp lệ.");
      return;
    }

    if (!(file instanceof Blob)) {
      setErrorMessage("File không hợp lệ.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Vui lòng chọn ảnh định dạng jpg, png...");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const reader = new FileReader();
    setIsImageUploading(true);
    reader.onloadend = () => {
      onFileUpload(reader.result as string);
      setIsImageUploading(false);

      // ✅ Reset input để có thể chọn lại cùng ảnh
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsDataURL(file);
    setErrorMessage(null);
  };

  return (
    <div className="message-input-container">
      <div
        className={`file-upload-area ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef} // ✅ Gán ref
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
          id="file-upload"
        />
        <label htmlFor="file-upload" className="file-upload-label">
          {imageBase64 ? (
            <img
              src={imageBase64}
              alt="Uploaded preview"
              className="image-preview"
            />
          ) : (
            <FiPlus />
          )}
        </label>
        {isDragging && <div className="drag-overlay">Thả ảnh vào đây</div>}
      </div>

      {errorMessage && <div className="error-message">{errorMessage}</div>}

      <input
        id="chat-input"
        type="text"
        value={inputText}
        onChange={onInputChange}
        onKeyPress={onKeyPress}
        placeholder="Dùng @tag để ra lệnh..."
        disabled={isLoading}
        autoComplete="off"
      />

      <button onClick={onSend} disabled={isLoading || isImageUploading}>
        {isImageUploading ? "Đang tải..." : "Gửi"}
      </button>
    </div>
  );
};
