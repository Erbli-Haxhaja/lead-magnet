import { db } from "@/db";
import { leads, documents, emailSends } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { LeadsTable } from "./leads-table";

export const dynamic = "force-dynamic";

async function getLeads() {
  const allLeads = await db
    .select({
      id: leads.id,
      email: leads.email,
      source: leads.source,
      capturedAt: leads.capturedAt,
    })
    .from(leads)
    .orderBy(desc(leads.capturedAt));

  // Get document titles for sources
  const allDocs = await db
    .select({ slug: documents.slug, title: documents.title })
    .from(documents);

  const slugToTitle = Object.fromEntries(
    allDocs.map((d) => [d.slug, d.title])
  );

  return allLeads.map((lead) => ({
    ...lead,
    documentTitle: lead.source ? slugToTitle[lead.source] || lead.source : null,
  }));
}

async function getDocumentSlugs() {
  const docs = await db
    .select({ slug: documents.slug, title: documents.title })
    .from(documents);
  return docs;
}

export default async function LeadsPage() {
  const [allLeads, docSlugs] = await Promise.all([
    getLeads(),
    getDocumentSlugs(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Leads</h1>
          <p className="text-muted-foreground mt-1">
            All captured email addresses from your lead magnets
          </p>
        </div>
        <div className="flex items-center gap-6 mr-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-htd-purple-light">
              {allLeads.length}
            </p>
            <p className="text-xs text-muted-foreground">Total Leads</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {new Set(allLeads.map((l) => l.email)).size}
            </p>
            <p className="text-xs text-muted-foreground">Unique Emails</p>
          </div>
        </div>
      </div>

      <LeadsTable
        leads={allLeads}
        documentSlugs={docSlugs}
      />
    </div>
  );
}
