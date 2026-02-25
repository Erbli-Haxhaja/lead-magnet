import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailSends } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const emailId = req.nextUrl.searchParams.get("emailId");

  if (!emailId) {
    return NextResponse.json({ error: "Missing emailId" }, { status: 400 });
  }

  const [send] = await db
    .select({ status: emailSends.status })
    .from(emailSends)
    .where(eq(emailSends.resendEmailId, emailId))
    .limit(1);

  if (!send) {
    return NextResponse.json({ status: "pending" });
  }

  return NextResponse.json({ status: send.status });
}
