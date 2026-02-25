"use server";

import { db } from "@/db";
import { leads, emailSends, documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { resend } from "@/lib/resend";
import { getFromR2 } from "@/lib/r2";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Rate limiting: in-memory store (resets on server restart, good enough for basic protection)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxAttempts: number = 3, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (entry.count >= maxAttempts) {
    return false;
  }
  
  entry.count++;
  return true;
}

export async function submitLeadEmail(slug: string, email: string) {
  // Simple regex validation
  if (!email || !EMAIL_REGEX.test(email)) {
    return { error: "Please enter a valid email address" };
  }

  // Rate limit: 3 attempts per email per hour
  if (!checkRateLimit(email)) {
    return { error: "Too many attempts. Please try again later." };
  }

  // Find the document
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.slug, slug))
    .limit(1);

  if (!doc || !doc.isActive) {
    return { error: "This document is no longer available" };
  }

  try {
    // Upsert lead
    const [lead] = await db
      .insert(leads)
      .values({
        email,
        source: slug,
      })
      .returning();

    // Fetch file from R2
    const fileResponse = await getFromR2(doc.fileKey);
    const fileBuffer = await fileResponse.Body?.transformToByteArray();

    if (!fileBuffer) {
      return { error: "Failed to retrieve the document. Please try again." };
    }

    // Send email with attachment
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "HTD Solutions <info@htd.solutions>",
      to: [email],
      subject: `Your free resource: ${doc.title}`,
      html: generateEmailHtml(doc.title, doc.description),
      attachments: [
        {
          filename: doc.fileName,
          content: Buffer.from(fileBuffer),
        },
      ],
      tags: [
        { name: "type", value: "lead_magnet" },
        { name: "document_slug", value: slug },
      ],
    });

    if (error) {
      console.error("Resend error:", error);
      return { error: "Failed to send email. Please check your address and try again." };
    }

    // Save email send record
    await db.insert(emailSends).values({
      documentId: doc.id,
      leadId: lead.id,
      resendEmailId: data?.id || null,
      status: "sent",
    });

    return { 
      success: true, 
      emailSendId: data?.id || null,
    };
  } catch (error) {
    console.error("Send error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

function generateEmailHtml(title: string, description: string | null): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0e1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:48px;height:48px;background:linear-gradient(135deg,#7c3aed,#5b21b6);border-radius:12px;line-height:48px;font-size:20px;font-weight:bold;color:white;">H</div>
      <p style="color:#a78bfa;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:12px;font-weight:600;">HTD Solutions</p>
    </div>
    
    <!-- Card -->
    <div style="background-color:#111827;border:1px solid #2a2f3e;border-radius:16px;padding:40px 32px;text-align:center;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#7c3aed20,#10b98120);border-radius:16px;margin:0 auto 24px;line-height:64px;">
        <span style="font-size:32px;">📄</span>
      </div>
      
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;">Here's your document!</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.6;">
        Thank you for your interest. Your requested document <strong style="color:#a78bfa;">"${title}"</strong> is attached to this email.
      </p>
      
      ${description ? `
      <div style="background-color:#1a1f2e;border:1px solid #2a2f3e;border-radius:12px;padding:16px;margin-bottom:24px;text-align:left;">
        <p style="color:#94a3b8;font-size:13px;margin:0;line-height:1.6;">${description}</p>
      </div>
      ` : ''}
      
      <div style="background:linear-gradient(135deg,#7c3aed15,#10b98115);border:1px solid #7c3aed30;border-radius:12px;padding:16px;margin-bottom:8px;">
        <p style="color:#10b981;font-size:14px;font-weight:600;margin:0 0 4px;">📎 File attached below</p>
        <p style="color:#94a3b8;font-size:12px;margin:0;">Check the attachment to access your document</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;">
      <p style="color:#4a5568;font-size:12px;margin:0;">
        Sent with ❤️ by <span style="color:#a78bfa;">HTD Solutions</span>
      </p>
      <p style="color:#374151;font-size:11px;margin-top:8px;">
        You received this because you requested a document from us.
      </p>
    </div>
  </div>
</body>
</html>`;
}
