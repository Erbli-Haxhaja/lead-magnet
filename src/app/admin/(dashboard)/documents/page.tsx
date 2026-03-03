import { db } from "@/db";
import { documents, emailSends, documentViews, senders, emailTemplates, posts } from "@/db/schema";
import { eq, sql, count, inArray } from "drizzle-orm";
import { DocumentsTable } from "./documents-table";

export const dynamic = "force-dynamic";

type PostBreakdown = {
  postId: string | null;
  postName: string;
  platform: string;
  views: number;
  emailsSent: number;
  delivered: number;
};

async function getDocumentsWithStats() {
  // 1. Fetch all documents in one query
  const docs = await db.select().from(documents).orderBy(documents.createdAt);
  if (docs.length === 0) return [];

  const docIds = docs.map((d) => d.id);

  // 2. Batch-fetch all aggregate stats in parallel (3 queries instead of 3 × N)
  const [viewCounts, sentCounts, deliveredCounts, allSenders, allTemplates, linkedPosts, viewsByDocPost, sentByDocPost, deliveredByDocPost] = await Promise.all([
    // Total views per document
    db.select({ documentId: documentViews.documentId, count: count() })
      .from(documentViews)
      .where(inArray(documentViews.documentId, docIds))
      .groupBy(documentViews.documentId),

    // Total sends per document
    db.select({ documentId: emailSends.documentId, count: count() })
      .from(emailSends)
      .where(inArray(emailSends.documentId, docIds))
      .groupBy(emailSends.documentId),

    // Total delivered per document
    db.select({ documentId: emailSends.documentId, count: count() })
      .from(emailSends)
      .where(sql`${emailSends.documentId} IN ${docIds} AND ${emailSends.status} = 'delivered'`)
      .groupBy(emailSends.documentId),

    // All senders at once
    db.select().from(senders),

    // All templates at once
    db.select().from(emailTemplates),

    // All posts linked to these documents
    db.select({ id: posts.id, name: posts.name, platform: posts.platform, documentId: posts.documentId })
      .from(posts)
      .where(inArray(posts.documentId, docIds)),

    // Views grouped by document + post
    db.select({ documentId: documentViews.documentId, postId: documentViews.postId, count: count() })
      .from(documentViews)
      .where(inArray(documentViews.documentId, docIds))
      .groupBy(documentViews.documentId, documentViews.postId),

    // Sends grouped by document + post
    db.select({ documentId: emailSends.documentId, postId: emailSends.postId, count: count() })
      .from(emailSends)
      .where(inArray(emailSends.documentId, docIds))
      .groupBy(emailSends.documentId, emailSends.postId),

    // Delivered grouped by document + post
    db.select({ documentId: emailSends.documentId, postId: emailSends.postId, count: count() })
      .from(emailSends)
      .where(sql`${emailSends.documentId} IN ${docIds} AND ${emailSends.status} = 'delivered'`)
      .groupBy(emailSends.documentId, emailSends.postId),
  ]);

  // Build lookup maps
  const viewMap = new Map(viewCounts.map((r) => [r.documentId, r.count]));
  const sentMap = new Map(sentCounts.map((r) => [r.documentId, r.count]));
  const deliveredMap = new Map(deliveredCounts.map((r) => [r.documentId, r.count]));
  const senderMap = new Map(allSenders.map((s) => [s.id, `${s.name} <${s.email}>`]));
  const templateMap = new Map(allTemplates.map((t) => [t.id, t.name]));

  // Post details map
  const postMap = new Map(linkedPosts.map((p) => [p.id, { name: p.name, platform: p.platform, documentId: p.documentId }]));

  // Group breakdowns by document
  const viewsByDocPostMap = new Map<string, Map<string | null, number>>();
  viewsByDocPost.forEach((r) => {
    if (!viewsByDocPostMap.has(r.documentId)) viewsByDocPostMap.set(r.documentId, new Map());
    viewsByDocPostMap.get(r.documentId)!.set(r.postId, r.count);
  });

  const sentByDocPostMap = new Map<string, Map<string | null, number>>();
  sentByDocPost.forEach((r) => {
    if (!sentByDocPostMap.has(r.documentId)) sentByDocPostMap.set(r.documentId, new Map());
    sentByDocPostMap.get(r.documentId)!.set(r.postId, r.count);
  });

  const deliveredByDocPostMap = new Map<string, Map<string | null, number>>();
  deliveredByDocPost.forEach((r) => {
    if (!deliveredByDocPostMap.has(r.documentId)) deliveredByDocPostMap.set(r.documentId, new Map());
    deliveredByDocPostMap.get(r.documentId)!.set(r.postId, r.count);
  });

  return docs.map((doc) => {
    // Collect all post IDs relevant to this document
    const allPostIds = new Set<string | null>();
    viewsByDocPostMap.get(doc.id)?.forEach((_, pid) => allPostIds.add(pid));
    sentByDocPostMap.get(doc.id)?.forEach((_, pid) => allPostIds.add(pid));
    deliveredByDocPostMap.get(doc.id)?.forEach((_, pid) => allPostIds.add(pid));
    linkedPosts.filter((p) => p.documentId === doc.id).forEach((p) => allPostIds.add(p.id));

    const breakdowns: PostBreakdown[] = [...allPostIds].map((pid) => {
      const postInfo = pid ? postMap.get(pid) : null;
      return {
        postId: pid,
        postName: postInfo?.name ?? "Direct Link",
        platform: postInfo?.platform ?? "direct",
        views: viewsByDocPostMap.get(doc.id)?.get(pid) ?? 0,
        emailsSent: sentByDocPostMap.get(doc.id)?.get(pid) ?? 0,
        delivered: deliveredByDocPostMap.get(doc.id)?.get(pid) ?? 0,
      };
    });

    breakdowns.sort((a, b) => {
      if (a.postId === null) return 1;
      if (b.postId === null) return -1;
      return b.views - a.views;
    });

    return {
      ...doc,
      views: viewMap.get(doc.id) ?? 0,
      emailsSent: sentMap.get(doc.id) ?? 0,
      delivered: deliveredMap.get(doc.id) ?? 0,
      senderName: doc.senderId ? senderMap.get(doc.senderId) ?? null : null,
      templateName: doc.emailTemplateId ? templateMap.get(doc.emailTemplateId) ?? null : null,
      postBreakdowns: breakdowns,
    };
  });
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
