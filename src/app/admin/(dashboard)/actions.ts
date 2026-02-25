"use server";

import { db } from "@/db";
import { documents } from "@/db/schema";
import { uploadToR2 } from "@/lib/r2";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const short = uuidv4().split("-")[0];
  return `${base}-${short}`;
}

export async function uploadDocument(formData: FormData) {
  const session = await auth();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const file = formData.get("file") as File;

  if (!title || !file) {
    return { error: "Title and file are required" };
  }

  const maxSize = (parseInt(process.env.MAX_FILE_SIZE_MB || "25") || 25) * 1024 * 1024;
  if (file.size > maxSize) {
    return { error: `File size exceeds ${process.env.MAX_FILE_SIZE_MB || 25}MB limit` };
  }

  try {
    const slug = generateSlug(title);
    const ext = file.name.split(".").pop() || "bin";
    const fileKey = `documents/${slug}.${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await uploadToR2(fileKey, buffer, file.type);

    const [doc] = await db
      .insert(documents)
      .values({
        title,
        description: description || null,
        slug,
        fileKey,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      })
      .returning();

    return { success: true, document: doc };
  } catch (error) {
    console.error("Upload error:", error);
    return { error: "Failed to upload document. Please try again." };
  }
}

export async function toggleDocumentActive(id: string, isActive: boolean) {
  const session = await auth();
  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    await db
      .update(documents)
      .set({ isActive })
      .where(eq(documents.id, id));
    return { success: true };
  } catch (error) {
    console.error("Toggle error:", error);
    return { error: "Failed to update document" };
  }
}

export async function deleteDocument(id: string) {
  const session = await auth();
  if (!session) {
    return { error: "Unauthorized" };
  }

  try {
    await db.delete(documents).where(eq(documents.id, id));
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { error: "Failed to delete document" };
  }
}
