#!/bin/bash

# Copy and rename crest files from Desktop to project
SOURCE_DIR="/Users/alan/Desktop/GGE new websie files"
DEST_DIR="/Users/alan/workspace/Gaa-Events/public/club-crests"

echo "Starting crest copy process..."
echo "Source: $SOURCE_DIR"
echo "Destination: $DEST_DIR"
echo ""

count=0
find "$SOURCE_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.gif" -o -name "*.webp" \) | while read -r file; do
  filename=$(basename "$file")
  # Convert to lowercase and replace spaces with hyphens
  newname=$(echo "$filename" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

  # Copy to destination
  cp "$file" "$DEST_DIR/$newname"

  count=$((count + 1))
  echo "[$count] Copied: $newname"
done

echo ""
echo "✅ Crest copy complete!"
echo "Total files copied: $(find "$DEST_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.gif" -o -name "*.webp" \) | wc -l)"
