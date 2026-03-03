import { db } from "@/db";
import { posts, documents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { EditPostForm } from "./edit-form";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!post) notFound();

  const allDocuments = await db
    .select({ id: documents.id, title: documents.title })
    .from(documents)
    .orderBy(documents.title);

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Post</h1>
        <p className="text-muted-foreground mt-1">
          Update post details
        </p>
      </div>

      <EditPostForm post={post} documents={allDocuments} />
    </div>
  );
}
