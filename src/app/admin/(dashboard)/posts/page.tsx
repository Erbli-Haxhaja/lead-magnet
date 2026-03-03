import { db } from "@/db";
import { posts, documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PostsTable } from "./posts-table";

export const dynamic = "force-dynamic";

async function getPostsWithDocuments() {
  const allPosts = await db
    .select({
      id: posts.id,
      documentId: posts.documentId,
      name: posts.name,
      platform: posts.platform,
      postUrl: posts.postUrl,
      createdAt: posts.createdAt,
      documentTitle: documents.title,
      documentSlug: documents.slug,
    })
    .from(posts)
    .leftJoin(documents, eq(posts.documentId, documents.id))
    .orderBy(posts.createdAt);

  return allPosts.map((row) => ({
    ...row,
    documentTitle: row.documentTitle ?? "Unknown Document",
    documentSlug: row.documentSlug ?? "",
  }));
}

export default async function PostsPage() {
  const allPosts = await getPostsWithDocuments();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Posts</h1>
          <p className="text-muted-foreground mt-1">
            Track social media posts promoting your lead magnets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-6 mr-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{allPosts.length}</p>
              <p className="text-xs text-muted-foreground">Total Posts</p>
            </div>
          </div>
        </div>
      </div>

      <PostsTable posts={allPosts} />
    </div>
  );
}
