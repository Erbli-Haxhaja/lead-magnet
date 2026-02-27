import { db } from "@/db";
import { documents, senders, emailTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditDocumentForm } from "./edit-form";

export const dynamic = "force-dynamic";

export default async function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  if (!doc) notFound();

  const allSenders = await db
    .select({ id: senders.id, name: senders.name, email: senders.email })
    .from(senders)
    .orderBy(senders.createdAt);

  const allTemplates = await db
    .select({
      id: emailTemplates.id,
      name: emailTemplates.name,
      subject: emailTemplates.subject,
    })
    .from(emailTemplates)
    .orderBy(emailTemplates.createdAt);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Document</h1>
        <p className="text-muted-foreground mt-1">
          Update document details, sender, and email template
        </p>
      </div>

      <EditDocumentForm
        document={doc}
        senders={allSenders}
        templates={allTemplates}
      />
    </div>
  );
}
