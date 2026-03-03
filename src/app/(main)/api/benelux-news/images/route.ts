import { NextResponse } from "next/server";

export async function GET() {
  const images = [
    "/club-crests/benelux-aachen-gaels.png",
    "/club-crests/benelux-amsterdam-gac.png",
    "/club-crests/benelux-brussels.png",
    "/club-crests/benelux-cologne-celts.png",
    "/club-crests/benelux-darmstadt.png",
    "/club-crests/benelux-den-haag.png",
    "/club-crests/benelux-dusseldorf.png",
    "/club-crests/benelux-earls-of-leuven.png",
    "/club-crests/benelux-ec-brussels.png",
    "/club-crests/benelux-eindhoven-shamrocks.png",
    "/club-crests/benelux-frankfurt.png",
    "/club-crests/benelux-groningen-gaels.png",
    "/club-crests/benelux-hamburg-gaa.png",
    "/club-crests/benelux-luxembourg.png",
    "/club-crests/benelux-maastricht-gaels.png",
    "/club-crests/benelux-nijmegen-gfc.png",
    "/images/Benelux Crest white background.png",
    "/images/gge-crest.png",
  ];

  return NextResponse.json({ images });
}
