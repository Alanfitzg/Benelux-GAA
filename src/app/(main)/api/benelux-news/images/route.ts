import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const images: string[] = [];

  const dirs = [
    { dir: "public/club-crests", prefix: "/club-crests", filter: /^benelux-/i },
    { dir: "public/images", prefix: "/images", filter: null },
  ];

  for (const { dir, prefix, filter } of dirs) {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) continue;

    const files = fs.readdirSync(fullPath);
    for (const file of files) {
      if (!/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(file)) continue;
      if (filter && !filter.test(file)) continue;
      const stat = fs.statSync(path.join(fullPath, file));
      if (stat.isFile()) {
        images.push(`${prefix}/${file}`);
      }
    }
  }

  images.sort((a, b) => a.localeCompare(b));

  return NextResponse.json({ images });
}
