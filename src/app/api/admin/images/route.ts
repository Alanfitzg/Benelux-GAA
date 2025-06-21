import { NextResponse } from "next/server"
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { requireSuperAdmin } from "@/lib/auth-helpers"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export async function GET() {
  try {
    const authResult = await requireSuperAdmin()
    if (authResult instanceof NextResponse) {
      return authResult
    }

    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME!,
    })

    const response = await s3Client.send(command)
    
    const images = (response.Contents || [])
      .filter(obj => obj.Key && obj.Key.match(/\.(jpg|jpeg|png|webp|gif)$/i))
      .map(obj => ({
        key: obj.Key!,
        url: `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${obj.Key}`,
        lastModified: obj.LastModified?.toISOString() || '',
        size: obj.Size || 0,
      }))
      .sort((a, b) => b.lastModified.localeCompare(a.lastModified))

    return NextResponse.json({ images })
  } catch (error) {
    console.error("Error listing S3 images:", error)
    return NextResponse.json(
      { error: "Failed to list images" },
      { status: 500 }
    )
  }
}