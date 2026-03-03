import { db } from "@/db";
import { documents, emailSends, documentViews, senders, emailTemplates, posts } from "@/db/schema";
import { eq, sql, count } from "drizzle-orm";
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

      // Fetch sender name
      let senderName: string | null = null;
      if (doc.senderId) {
        const [s] = await db
          .select({ name: senders.name, email: senders.email })
          .from(senders)
          .where(eq(senders.id, doc.senderId))
          .limit(1);
        if (s) senderName = `${s.name} <${s.email}>`;
      }

      // Fetch template name
      let templateName: string | null = null;
      if (doc.emailTemplateId) {
        const [t] = await db
          .select({ name: emailTemplates.name })
          .from(emailTemplates)
          .where(eq(emailTemplates.id, doc.emailTemplateId))
          .limit(1);
        if (t) templateName = t.name;
      }

      // Per-post breakdowns: views
      const viewsByPost = await db
        .select({
          postId: documentViews.postId,
          count: count(),
        })
        .from(documentViews)
        .where(eq(documentViews.documentId, doc.id))
        .groupBy(documentViews.postId);

      // Per-post breakdowns: sent
      const sentByPost = await db
        .select({
          postId: emailSends.postId,
          count: count(),
        })
        .from(emailSends)
        .where(eq(emailSends.documentId, doc.id))
        .groupBy(emailSends.postId);

      // Per-post breakdowns: delivered
      const deliveredByPost = await db
        .select({
          postId: emailSends.postId,
          count: count(),
        })
        .from(emailSends)
        .where(
          sql`${emailSends.documentId} = ${doc.id} AND ${emailSends.status} = 'delivered'`
        )
        .groupBy(emailSends.postId);

      // Collect all unique postIds from all three queries
      const allPostIds = new Set<string | null>();
      viewsByPost.forEach((r) => allPostIds.add(r.postId));
      sentByPost.forEach((r) => allPostIds.add(r.postId));
      deliveredByPost.forEach((r) => allPostIds.add(r.postId));

      // Also include all posts linked to this document (even if they have 0 stats)
      const linkedPosts = await db
        .select({ id: posts.id, name: posts.name, platform: posts.platform })
        .from(posts)
        .where(eq(posts.documentId, doc.id));

      // Fetch post details
      const postMap = new Map<string, { name: string; platform: string }>();
      linkedPosts.forEach((p) => {
        allPostIds.add(p.id);
        postMap.set(p.id, { name: p.name, platform: p.platform });
      });
      const postIds = [...allPostIds].filter((id): id is string => id !== null);
      // Fetch any additional post details from stats that aren't already in the map
      const missingIds = postIds.filter((id) => !postMap.has(id));
      if (missingIds.length > 0) {
        const postDetails = await db
          .select({ id: posts.id, name: posts.name, platform: posts.platform })
          .from(posts)
          .where(sql`${posts.id} IN ${missingIds}`);
        postDetails.forEach((p) =>
          postMap.set(p.id, { name: p.name, platform: p.platform })
        );
      }

      // Build breakdown array
      const breakdowns: PostBreakdown[] = [...allPostIds].map((pid) => {
        const v = viewsByPost.find((r) => r.postId === pid);
        const s = sentByPost.find((r) => r.postId === pid);
        const d = deliveredByPost.find((r) => r.postId === pid);
        const postInfo = pid ? postMap.get(pid) : null;

        return {
          postId: pid,
          postName: postInfo?.name ?? "Direct Link",
          platform: postInfo?.platform ?? "direct",
          views: v?.count ?? 0,
          emailsSent: s?.count ?? 0,
          delivered: d?.count ?? 0,
        };
      });

      // Sort: organic last, then by views descending
      breakdowns.sort((a, b) => {
        if (a.postId === null) return 1;
        if (b.postId === null) return -1;
        return b.views - a.views;
      });

      return {
        ...doc,
        views: viewCount?.count ?? 0,
        emailsSent: sentCount?.count ?? 0,
        delivered: deliveredCount?.count ?? 0,
        senderName,
        templateName,
        postBreakdowns: breakdowns,
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
