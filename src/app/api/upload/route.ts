import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { requireAuth } from "@/lib/auth-helpers";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const runtime = "nodejs"; // Ensure Node.js runtime for file uploads

async function uploadHandler(req: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) {
    return authResult;
  }
  
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const uploadType = formData.get("type") as string | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Determine the folder based on upload type
    let folder = "";
    if (uploadType === "club-crest") {
      folder = "club-crests/";
    } else if (uploadType === "event-image") {
      folder = "event-images/";
    }
    // Add more folder types as needed
    
    const fileName = `${folder}${Date.now()}-${file.name}`;
    const bucket = process.env.S3_BUCKET_NAME!;
    const uploadParams = {
      Bucket: bucket,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    };
    await s3.send(new PutObjectCommand(uploadParams));
    const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("S3 upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// Apply rate limiting to upload endpoint
export const POST = withRateLimit(RATE_LIMITS.UPLOAD, uploadHandler);
