import { db } from "@/db";
import { documents, emailSends, documentViews } from "@/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { DocumentsTable } from "./documents-table";

export const dynamic = "force-dynamic";

async function getDocumentsWithStats() {
  const docs = await db.select().from(documents).orderBy(documents.createdAt);

  const stats = await Promise.all(
    docs.map(async (doc) => {
      const [viewCount] = await db
        .select({ count: count() })
        .from(documentViews)
        .where(eq(documentViews.documentId, doc.id));

      const [sentCount] = await db
        .select({ count: count() })
        .from(emailSends)
        .where(eq(emailSends.documentId, doc.id));

      const [deliveredCount] = await db
        .select({ count: count() })
        .from(emailSends)
        .where(
          sql`${emailSends.documentId} = ${doc.id} AND ${emailSends.status} = 'delivered'`
        );

      return {
        ...doc,
        views: viewCount?.count ?? 0,
        emailsSent: sentCount?.count ?? 0,
        delivered: deliveredCount?.count ?? 0,
      };
    })
  );

  return stats;
}

export default async function DocumentsPage() {
  const docs = await getDocumentsWithStats();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Documents</h1>
          <p className="text-muted-foreground mt-1">
            Manage your lead magnets and track performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-6 mr-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{docs.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-htd-green">
                {docs.reduce((acc, d) => acc + d.delivered, 0)}
              </p>
              <p className="text-xs text-muted-foreground">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      <DocumentsTable documents={docs} />
    </div>
  );
}
