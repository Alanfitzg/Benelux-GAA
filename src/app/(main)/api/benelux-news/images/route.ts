import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const images: string[] = [];

  const dirs = [
    { dir: "public/club-crests", prefix: "/club-crests" },
    { dir: "public/images", prefix: "/images" },
  ];

  for (const { dir, prefix } of dirs) {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) continue;

    const files = fs.readdirSync(fullPath);
    for (const file of files) {
      if (/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(file)) {
        const stat = fs.statSync(path.join(fullPath, file));
        if (stat.isFile()) {
          images.push(`${prefix}/${file}`);
        }
      }
    }
  }

  images.sort((a, b) => {
    const aIsBenelux = a.includes("benelux-");
    const bIsBenelux = b.includes("benelux-");
    if (aIsBenelux && !bIsBenelux) return -1;
    if (!aIsBenelux && bIsBenelux) return 1;
    return a.localeCompare(b);
  });

  return NextResponse.json({ images });
}
