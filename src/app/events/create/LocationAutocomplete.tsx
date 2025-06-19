import React, { useState } from "react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

export default function LocationAutocomplete({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [suggestions, setSuggestions] = useState<{ place_name: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  async function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);
    if (val.length < 2) {
      setSuggestions([]);
      return;
    }
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(val)}.json?types=place&access_token=${MAPBOX_TOKEN}`
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
        onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
        onFocus={() => setShowSuggestions(true)}
        placeholder="City, Country"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
        autoComplete="off"
        required
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded w-full mt-1 max-h-48 overflow-y-auto shadow">
          {suggestions.map((s, i) => (
            <li
              key={i}
              className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-gray-900"
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