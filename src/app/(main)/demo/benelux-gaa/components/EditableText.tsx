"use client";

import { useState, useRef, useEffect, ElementType } from "react";
import { Pencil, Check, X, RotateCcw, Bold } from "lucide-react";
import { useClubContent } from "../context/ClubContentContext";

interface EditableTextProps {
  pageKey: string;
  contentKey: string;
  defaultValue: string;
  maxLength?: number;
  as?: ElementType;
  className?: string;
  editClassName?: string;
  allowBold?: boolean;
}

export default function EditableText({
  pageKey,
  contentKey,
  defaultValue,
  maxLength = 200,
  as: Component = "span",
  className = "",
  editClassName = "",
  allowBold = false,
}: EditableTextProps) {
  const { isAdmin, getContent, saveContent } = useClubContent();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");
  const [originalValue, setOriginalValue] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [originalIsBold, setOriginalIsBold] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const displayValue = getContent(pageKey, contentKey, defaultValue);
  const boldValue = getContent(pageKey, `${contentKey}_bold`, "false");
  const displayIsBold = boldValue === "true";
  const hasBeenModified = displayValue !== defaultValue || displayIsBold;

  useEffect(() => {
    setValue(displayValue);
    setOriginalValue(displayValue);
    setIsBold(displayIsBold);
    setOriginalIsBold(displayIsBold);
  }, [displayValue, displayIsBold]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const textChanged = value !== originalValue;
    const boldChanged = allowBold && isBold !== originalIsBold;

    if (!textChanged && !boldChanged) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    let success = true;

    if (textChanged) {
      success = await saveContent(pageKey, contentKey, value, maxLength);
    }

    if (success && boldChanged) {
      success = await saveContent(
        pageKey,
        `${contentKey}_bold`,
        isBold ? "true" : "false",
        10
      );
    }

    setIsSaving(false);

    if (success) {
      setOriginalValue(value);
      setOriginalIsBold(isBold);
      setIsEditing(false);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
  };

  const handleCancel = () => {
    setValue(originalValue);
    setIsEditing(false);
  };

  const handleResetToDefault = async () => {
    if (!confirm("Reset this text to its original default value?")) {
      return;
    }
    setIsSaving(true);
    let success = await saveContent(
      pageKey,
      contentKey,
      defaultValue,
      maxLength
    );

    if (success && allowBold) {
      success = await saveContent(pageKey, `${contentKey}_bold`, "false", 10);
    }

    setIsSaving(false);

    if (success) {
      setValue(defaultValue);
      setOriginalValue(defaultValue);
      setIsBold(false);
      setOriginalIsBold(false);
      setIsEditing(false);
      setShowReset(true);
      setTimeout(() => setShowReset(false), 2000);
    }
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
    return (
      <Component className={`${className} ${displayIsBold ? "font-bold" : ""}`}>
        {displayValue}
      </Component>
    );
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
          className={`${className} w-full min-h-[1.5em] resize-none border-2 border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white text-gray-900 ${isBold ? "font-bold" : ""}`}
          style={{ font: "inherit" }}
          rows={Math.max(1, Math.ceil(value.length / 50))}
        />
        <div className="flex items-center justify-between mt-1 text-xs">
          <div className="flex items-center gap-2">
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
            {allowBold && (
              <button
                type="button"
                onClick={() => setIsBold(!isBold)}
                className={`p-1 rounded transition-colors ${
                  isBold
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
                title={isBold ? "Remove bold" : "Make bold"}
              >
                <Bold size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-1">
            {hasBeenModified && (
              <button
                type="button"
                onClick={handleResetToDefault}
                disabled={isSaving}
                className="p-1 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                title="Reset to default"
              >
                <RotateCcw size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isError}
              className="p-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              title="Save"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600"
              title="Cancel"
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
      className="relative inline-block group cursor-pointer transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsEditing(true)}
    >
      <Component
        className={`${className} ${displayIsBold ? "font-bold" : ""} ${isHovered ? "bg-blue-100/50 outline outline-2 outline-blue-300 outline-offset-2 rounded" : ""} transition-all duration-150`}
      >
        {displayValue}
      </Component>
      {isHovered && (
        <span className="absolute -top-2 -right-6 p-1 bg-blue-500 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity shadow-md z-10">
          <Pencil size={12} />
        </span>
      )}
      {showSaved && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-green-500 text-white text-xs rounded whitespace-nowrap shadow-md z-10">
          Saved!
        </span>
      )}
      {showReset && (
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-orange-500 text-white text-xs rounded whitespace-nowrap shadow-md z-10">
          Reset to default!
        </span>
      )}
    </span>
  );
}
