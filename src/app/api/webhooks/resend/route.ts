import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailSends } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

// Resend webhook event types we care about
type ResendWebhookEvent = {
  type:
    | "email.sent"
    | "email.delivered"
    | "email.delivery_delayed"
    | "email.bounced"
    | "email.complained"
    | "email.opened"
    | "email.clicked"
    | "email.failed";
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    tags?: Record<string, string>;
  };
};

function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return true; // Skip verification if no secret configured
  
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("svix-signature");
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    // Verify signature if secret is configured
    if (webhookSecret && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event: ResendWebhookEvent = JSON.parse(rawBody);
    const emailId = event.data?.email_id;

    if (!emailId) {
      return NextResponse.json({ error: "No email_id" }, { status: 400 });
    }

    console.log(`[Webhook] ${event.type} for ${emailId}`);

    switch (event.type) {
      case "email.delivered":
        await db
          .update(emailSends)
          .set({
            status: "delivered",
            deliveredAt: new Date(event.created_at),
          })
          .where(eq(emailSends.resendEmailId, emailId));
        break;

      case "email.bounced":
        await db
          .update(emailSends)
          .set({ status: "bounced" })
          .where(eq(emailSends.resendEmailId, emailId));
        break;

      case "email.failed":
        await db
          .update(emailSends)
          .set({ status: "failed" })
          .where(eq(emailSends.resendEmailId, emailId));
        break;

      case "email.complained":
        await db
          .update(emailSends)
          .set({ status: "complained" })
          .where(eq(emailSends.resendEmailId, emailId));
        break;

      case "email.delivery_delayed":
        await db
          .update(emailSends)
          .set({ status: "delayed" })
          .where(eq(emailSends.resendEmailId, emailId));
        break;

      case "email.sent":
        await db
          .update(emailSends)
          .set({ status: "sent" })
          .where(eq(emailSends.resendEmailId, emailId));
        break;

      default:
        // email.opened, email.clicked — logged but no status change
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
