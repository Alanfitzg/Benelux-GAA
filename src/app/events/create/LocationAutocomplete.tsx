import React, { useState } from "react";
import { URLS, MESSAGES, UI } from "@/lib/constants";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

export default function LocationAutocomplete({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [suggestions, setSuggestions] = useState<{ place_name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  async function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);
    if (val.length < UI.AUTOCOMPLETE_MIN_LENGTH) {
      setSuggestions([]);
      return;
    }
    const res = await fetch(
      `${URLS.MAPBOX_GEOCODING}/${encodeURIComponent(val)}.json?types=place&access_token=${MAPBOX_TOKEN}`
    );
    const data = await res.json();
    setSuggestions(data.features || []);
    setShowSuggestions(true);
  }

  function handleSelect(suggestion: string) {
    onChange(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInput}
        onBlur={() => setTimeout(() => setShowSuggestions(false), UI.AUTOCOMPLETE_BLUR_TIMEOUT)}
        onFocus={() => setShowSuggestions(true)}
        placeholder={MESSAGES.DEFAULTS.LOCATION_PLACEHOLDER}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 bg-gray-50/50 text-gray-900 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-300 placeholder-gray-500"
        autoComplete="off"
        required
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-20 bg-white border-2 border-gray-200 rounded-xl w-full mt-2 max-h-48 overflow-y-auto shadow-professional">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-4 py-3 hover:bg-primary/5 cursor-pointer text-gray-900 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              onMouseDown={() => handleSelect(s.place_name)}
            >
              {s.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 