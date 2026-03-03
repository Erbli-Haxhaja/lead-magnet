"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deletePost, resetPostStats } from "../actions";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PostWithDocument = {
  id: string;
  documentId: string;
  name: string;
  platform: string;
  postUrl: string;
  createdAt: Date;
  documentTitle: string;
  documentSlug: string;
};

const PLATFORM_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  linkedin: {
    label: "LinkedIn",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
  },
  tiktok: {
    label: "TikTok",
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/30",
  },
  instagram: {
    label: "Instagram",
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
  },
  facebook: {
    label: "Facebook",
    color: "text-blue-300",
    bg: "bg-blue-400/10 border-blue-400/30",
  },
  x: {
    label: "X",
    color: "text-gray-300",
    bg: "bg-gray-500/10 border-gray-500/30",
  },
  youtube: {
    label: "YouTube",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
  },
};

export function PostsTable({ posts }: { posts: PostWithDocument[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    setLoadingId(id);
    const result = await deletePost(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Post deleted");
      router.refresh();
    }
    setLoadingId(null);
  }

  async function handleReset(id: string, name: string) {
    if (
      !confirm(
        `Are you sure you want to reset all statistics for "${name}"?\n\nThis will delete all views, email sends, and leads tracked to this post. This action cannot be undone.`
      )
    )
      return;

    setLoadingId(id);
    const result = await resetPostStats(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Post statistics reset successfully");
      router.refresh();
    }
    setLoadingId(null);
  }

  function copyTrackingLink(postId: string, slug: string) {
    const url = `${window.location.origin}/d/${slug}?ref=${postId}`;
    navigator.clipboard.writeText(url);
    toast.success("Tracking link copied to clipboard!");
  }

  if (posts.length === 0) {
    return (
      <div className="bg-htd-card border border-htd-card-border rounded-xl p-12 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-htd-purple/10 flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-htd-purple-light"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
        </div>
        <h3 className="text-white text-lg font-semibold mb-1">No posts yet</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Add your first social media post to start tracking
        </p>
        <Link href="/admin/posts/new">
          <Button className="bg-htd-purple hover:bg-htd-purple-dark text-white">
            Add Post
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/admin/posts/new">
          <Button className="bg-htd-purple hover:bg-htd-purple-dark text-white">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Post
          </Button>
        </Link>
      </div>

      <div className="bg-htd-card border border-htd-card-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-htd-card-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Platform</TableHead>
              <TableHead className="text-muted-foreground">Document</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
              <TableHead className="text-muted-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => {
              const platform =
                PLATFORM_CONFIG[post.platform] || PLATFORM_CONFIG.x;

              return (
                <TableRow
                  key={post.id}
                  className="border-htd-card-border hover:bg-white/[0.02]"
                >
                  <TableCell>
                    <p className="text-white font-medium">{post.name}</p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${platform.bg} ${platform.color} text-xs`}
                    >
                      {platform.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {post.documentTitle}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-htd-purple-light hover:bg-htd-purple/10"
                        title="Copy tracking link"
                        onClick={() =>
                          copyTrackingLink(post.id, post.documentSlug)
                        }
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                          />
                        </svg>
                      </Button>
                      <a
                        href={post.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-white"
                          title="Open post"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </Button>
                      </a>
                      <Link href={`/admin/posts/${post.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-white"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10"
                        title="Reset statistics"
                        onClick={() => handleReset(post.id, post.name)}
                        disabled={loadingId === post.id}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-red-400"
                        title="Delete post"
                        onClick={() => handleDelete(post.id, post.name)}
                        disabled={loadingId === post.id}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
