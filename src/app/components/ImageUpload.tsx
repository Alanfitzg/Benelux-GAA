import React, { useRef, useState } from "react";

export default function ImageUpload({
  value,
  onChange,
  uploading,
  error,
}: {
  value: string | null;
  onChange: (file: File | null) => void;
  uploading?: boolean;
  error?: string;
}) {
  const [preview, setPreview] = useState<string | null>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    if (file) {
      setPreview(URL.createObjectURL(file));
      onChange(file);
    } else {
      setPreview(null);
      onChange(null);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      setPreview(URL.createObjectURL(file));
      onChange(file);
    }
  }

  return (
    <div>
      <div
        className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition hover:border-blue-500 ${
          preview ? "border-green-400" : "border-gray-300"
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="max-h-40 mb-2 rounded object-contain"
          />
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="w-10 h-10 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 48 48"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 32l6-6 4 4 8-8M6 40V8a2 2 0 012-2h32a2 2 0 012 2v32a2 2 0 01-2 2H8a2 2 0 01-2-2z"
              />
            </svg>
            <span className="text-gray-500">Click or drag an image here</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      {preview && (
        <button
          type="button"
          className="mt-2 text-red-600 hover:underline text-sm"
          onClick={() => {
            setPreview(null);
            onChange(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        >
          Remove image
        </button>
      )}
      {uploading && <div className="text-blue-700 mt-2">Uploading image...</div>}
      {error && <div className="text-red-600 mt-2">{error}</div>}
    </div>
  );
} 