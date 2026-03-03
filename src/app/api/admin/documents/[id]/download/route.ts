import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client, BUCKET } from "@/lib/r2";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: doc.fileKey,
    ResponseContentDisposition: `attachment; filename="${doc.fileName}"`,
  });

  // Signed URL valid for 60 seconds — just enough to trigger the browser download
  const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });

  return NextResponse.redirect(url);
}
