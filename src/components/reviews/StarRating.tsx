"use client";

import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const labels: Record<number, string> = {
  1: "Very Poor",
  2: "Poor",
  3: "Average",
  4: "Good",
  5: "Excellent",
};

export function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  showLabel = true,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const displayRating = hoverRating || rating;

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, value: number) => {
    if (readonly) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(value);
    }
    if (e.key === "ArrowRight" && value < 5 && onRatingChange) {
      onRatingChange(Math.min(5, rating + 1));
    }
    if (e.key === "ArrowLeft" && value > 1 && onRatingChange) {
      onRatingChange(Math.max(1, rating - 1));
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-1" role="radiogroup" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => handleClick(value)}
            onMouseEnter={() => !readonly && setHoverRating(value)}
            onMouseLeave={() => setHoverRating(0)}
            onKeyDown={(e) => handleKeyDown(e, value)}
            disabled={readonly}
            className={`
              ${sizeClasses[size]}
              ${readonly ? "cursor-default" : "cursor-pointer"}
              transition-transform duration-150
              ${!readonly && "hover:scale-110 active:scale-95"}
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded
            `}
            role="radio"
            aria-checked={rating === value}
            aria-label={`${value} star${value !== 1 ? "s" : ""}`}
            tabIndex={readonly ? -1 : rating === value ? 0 : -1}
          >
            <svg
              viewBox="0 0 24 24"
              fill={value <= displayRating ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={1.5}
              className={`
                ${value <= displayRating ? "text-yellow-400" : "text-gray-300"}
                transition-colors duration-150
              `}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          </button>
        ))}
      </div>
      {showLabel && displayRating > 0 && (
        <span
          className={`
            text-sm font-medium transition-colors duration-150
            ${displayRating <= 2 ? "text-red-600" : ""}
            ${displayRating === 3 ? "text-yellow-600" : ""}
            ${displayRating >= 4 ? "text-green-600" : ""}
          `}
        >
          {labels[displayRating]}
        </span>
      )}
    </div>
  );
}
