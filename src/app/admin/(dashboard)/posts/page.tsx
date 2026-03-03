import { db } from "@/db";
import { posts, documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { PostsTable } from "./posts-table";

export const dynamic = "force-dynamic";

async function getPostsWithDocuments() {
  const allPosts = await db
    .select()
    .from(posts)
    .orderBy(posts.createdAt);

  const enriched = await Promise.all(
    allPosts.map(async (post) => {
      const [doc] = await db
        .select({ title: documents.title, slug: documents.slug })
        .from(documents)
        .where(eq(documents.id, post.documentId))
        .limit(1);

      return {
        ...post,
        documentTitle: doc?.title ?? "Unknown Document",
        documentSlug: doc?.slug ?? "",
      };
    })
  );

  return enriched;
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
