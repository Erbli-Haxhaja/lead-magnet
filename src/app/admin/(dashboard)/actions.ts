"use server";

import { db } from "@/db";
import { documents, senders, emailTemplates, leads } from "@/db/schema";
import { uploadToR2, deleteFromR2 } from "@/lib/r2";
import { auth } from "@/lib/auth";
import { eq, inArray } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const short = uuidv4().split("-")[0];
  return `${base}-${short}`;
}

// ─── Document Actions ────────────────────────────────────────

export async function uploadDocument(formData: FormData) {
  const session = await auth();
  if (!session) {
    return { error: "Unauthorized" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const file = formData.get("file") as File;
  const senderId = formData.get("senderId") as string | null;
  const emailTemplateId = formData.get("emailTemplateId") as string | null;

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
        senderId: senderId || null,
        emailTemplateId: emailTemplateId || null,
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

export async function updateDocument(id: string, formData: FormData) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const senderId = formData.get("senderId") as string | null;
  const emailTemplateId = formData.get("emailTemplateId") as string | null;
  const file = formData.get("file") as File | null;

  if (!title) return { error: "Title is required" };

  try {
    const updateData: Record<string, unknown> = {
      title,
      description: description || null,
      senderId: senderId || null,
      emailTemplateId: emailTemplateId || null,
    };

    // If a new file was uploaded, replace it in R2
    if (file && file.size > 0) {
      const maxSize =
        (parseInt(process.env.MAX_FILE_SIZE_MB || "25") || 25) * 1024 * 1024;
      if (file.size > maxSize) {
        return {
          error: `File size exceeds ${process.env.MAX_FILE_SIZE_MB || 25}MB limit`,
        };
      }

      // Get the current doc to delete old file
      const [current] = await db
        .select({ fileKey: documents.fileKey, slug: documents.slug })
        .from(documents)
        .where(eq(documents.id, id))
        .limit(1);

      if (current) {
        // Delete old file from R2
        try {
          await deleteFromR2(current.fileKey);
        } catch {
          // Continue even if old file delete fails
        }

        const ext = file.name.split(".").pop() || "bin";
        const fileKey = `documents/${current.slug}.${ext}`;

        const buffer = Buffer.from(await file.arrayBuffer());
        await uploadToR2(fileKey, buffer, file.type);

        updateData.fileKey = fileKey;
        updateData.fileName = file.name;
        updateData.fileType = file.type;
        updateData.fileSize = file.size;
      }
    }

    const [doc] = await db
      .update(documents)
      .set(updateData)
      .where(eq(documents.id, id))
      .returning();

    return { success: true, document: doc };
  } catch (error) {
    console.error("Update document error:", error);
    return { error: "Failed to update document. Please try again." };
  }
}

// ─── Sender Actions ──────────────────────────────────────────

export async function getSenders() {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  try {
    const data = await db
      .select()
      .from(senders)
      .orderBy(senders.createdAt);
    return { data };
  } catch (error) {
    console.error("Get senders error:", error);
    return { error: "Failed to load senders" };
  }
}

export async function createSender(name: string, email: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  if (!name || !email) return { error: "Name and email are required" };

  try {
    const [sender] = await db
      .insert(senders)
      .values({ name, email })
      .returning();
    return { success: true, sender };
  } catch (error) {
    console.error("Create sender error:", error);
    return { error: "Failed to create sender" };
  }
}

export async function deleteSender(id: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  try {
    await db.delete(senders).where(eq(senders.id, id));
    return { success: true };
  } catch (error) {
    console.error("Delete sender error:", error);
    return { error: "Failed to delete sender" };
  }
}

// ─── Email Template Actions ─────────────────────────────────

export async function getEmailTemplates() {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  try {
    const data = await db
      .select()
      .from(emailTemplates)
      .orderBy(emailTemplates.createdAt);
    return { data };
  } catch (error) {
    console.error("Get email templates error:", error);
    return { error: "Failed to load email templates" };
  }
}

export async function createEmailTemplate(
  name: string,
  subject: string,
  htmlBody: string,
  bodyFormat: string = "html"
) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  if (!name || !subject || !htmlBody) {
    return { error: "All fields are required" };
  }

  try {
    const [template] = await db
      .insert(emailTemplates)
      .values({ name, subject, htmlBody, bodyFormat })
      .returning();
    return { success: true, template };
  } catch (error) {
    console.error("Create email template error:", error);
    return { error: "Failed to create email template" };
  }
}

export async function updateEmailTemplate(
  id: string,
  name: string,
  subject: string,
  htmlBody: string,
  bodyFormat: string = "html"
) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  if (!name || !subject || !htmlBody) {
    return { error: "All fields are required" };
  }

  try {
    const [template] = await db
      .update(emailTemplates)
      .set({ name, subject, htmlBody, bodyFormat, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id))
      .returning();
    return { success: true, template };
  } catch (error) {
    console.error("Update email template error:", error);
    return { error: "Failed to update email template" };
  }
}

export async function deleteEmailTemplate(id: string) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  try {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
    return { success: true };
  } catch (error) {
    console.error("Delete email template error:", error);
    return { error: "Failed to delete email template" };
  }
}

// ─── Lead Actions ────────────────────────────────────────────

export async function deleteLeads(ids: string[]) {
  const session = await auth();
  if (!session) return { error: "Unauthorized" };

  if (!ids.length) return { error: "No leads selected" };

  try {
    await db.delete(leads).where(inArray(leads.id, ids));
    return { success: true, count: ids.length };
  } catch (error) {
    console.error("Delete leads error:", error);
    return { error: "Failed to delete leads" };
  }
}
