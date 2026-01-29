"use client";

import { useState, useRef, useEffect, ElementType } from "react";
import { Pencil, Check, X } from "lucide-react";
import { useClubContent } from "../context/ClubContentContext";

interface EditableTextProps {
  pageKey: string;
  contentKey: string;
  defaultValue: string;
  maxLength?: number;
  as?: ElementType;
  className?: string;
  editClassName?: string;
}

export default function EditableText({
  pageKey,
  contentKey,
  defaultValue,
  maxLength = 200,
  as: Component = "span",
  className = "",
  editClassName = "",
}: EditableTextProps) {
  const { isAdmin, getContent, saveContent } = useClubContent();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const displayValue = getContent(pageKey, contentKey, defaultValue);

  useEffect(() => {
    setValue(displayValue);
    setOriginalValue(displayValue);
  }, [displayValue]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    if (value === originalValue) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    const success = await saveContent(pageKey, contentKey, value, maxLength);
    setIsSaving(false);

    if (success) {
      setOriginalValue(value);
      setIsEditing(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
  };

  const handleCancel = () => {
    setValue(originalValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const charCount = value.length;
  const percentage = (charCount / maxLength) * 100;
  const isWarning = percentage >= 80 && percentage < 100;
  const isError = percentage >= 100;

  if (!isAdmin) {
    return <Component className={className}>{displayValue}</Component>;
  }

  if (isEditing) {
    return (
      <div className={`relative inline-block ${editClassName}`}>
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setTimeout(() => {
              if (!isSaving) handleSave();
            }, 150);
          }}
          className={`${className} w-full min-h-[1.5em] resize-none border-2 border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-gray-900`}
          style={{ font: "inherit" }}
          rows={Math.max(1, Math.ceil(value.length / 50))}
        />
        <div className="flex items-center justify-between mt-1 text-xs">
          <span
            className={`font-medium ${
              isError
                ? "text-red-600"
                : isWarning
                  ? "text-yellow-600"
                  : "text-gray-500"
            }`}
          >
            {charCount}/{maxLength}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isError}
              className="p-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <X size={14} />
            </button>
          </div>
        </div>
        {isError && (
          <p className="text-red-600 text-xs mt-1">
            Text is too long. Please shorten it.
          </p>
        )}
      </div>
    );
  }

  return (
    <span
      className="relative inline-block group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsEditing(true)}
    >
      <Component className={className}>{displayValue}</Component>
      {isHovered && (
        <span className="absolute -top-2 -right-6 p-1 bg-blue-500 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity">
          <Pencil size={12} />
        </span>
      )}
      {showSaved && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-green-500 text-white text-xs rounded whitespace-nowrap">
          Saved!
        </span>
      )}
    </span>
  );
}
