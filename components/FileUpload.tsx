import React, { ChangeEvent } from "react";

interface FileUploadProps {
  onProcessComplete: (file: File) => void;
}

export default function FileUpload({ onProcessComplete }: FileUploadProps) {
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onProcessComplete(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf,.jpg,.png"
        onChange={handleFileChange}
        className="file-input"  
      />
    </div>
  );
}
