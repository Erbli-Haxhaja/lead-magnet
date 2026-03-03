"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updatePost } from "../../../actions";
import { toast } from "sonner";

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "X" },
  { value: "youtube", label: "YouTube" },
];

type Post = {
  id: string;
  documentId: string;
  name: string;
  platform: string;
  postUrl: string;
  createdAt: Date;
};

type DocumentOption = { id: string; title: string };

export function EditPostForm({
  post,
  documents,
}: {
  post: Post;
  documents: DocumentOption[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(post.platform);
  const [selectedDocumentId, setSelectedDocumentId] = useState(
    post.documentId
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("platform", selectedPlatform);
    formData.set("documentId", selectedDocumentId);

    const result = await updatePost(post.id, formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Post updated successfully!");
      router.push("/admin/posts");
    }
    setLoading(false);
  }

  return (
    <Card className="bg-htd-card border-htd-card-border">
      <CardHeader>
        <CardTitle className="text-white">Post Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={post.name}
              placeholder="e.g. LinkedIn launch post #1"
              required
              className="bg-[#0a0e1a] border-htd-card-border text-white placeholder:text-muted-foreground"
            />
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <Label className="text-white">Platform</Label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setSelectedPlatform(p.value)}
                  className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200 ${
                    selectedPlatform === p.value
                      ? "bg-htd-purple/15 text-htd-purple-light border-htd-purple/30"
                      : "bg-[#0a0e1a] text-muted-foreground border-htd-card-border hover:text-white hover:border-white/20"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Document */}
          <div className="space-y-2">
            <Label htmlFor="documentId" className="text-white">
              Linked Document
            </Label>
            <select
              id="documentId"
              value={selectedDocumentId}
              onChange={(e) => setSelectedDocumentId(e.target.value)}
              className="w-full rounded-lg border bg-[#0a0e1a] border-htd-card-border text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-htd-purple/50"
              required
            >
              <option value="" className="text-muted-foreground">
                Select a document...
              </option>
              {documents.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                </option>
              ))}
            </select>
          </div>

          {/* Post URL */}
          <div className="space-y-2">
            <Label htmlFor="postUrl" className="text-white">
              Post URL
            </Label>
            <Input
              id="postUrl"
              name="postUrl"
              type="url"
              defaultValue={post.postUrl}
              placeholder="https://linkedin.com/posts/..."
              required
              className="bg-[#0a0e1a] border-htd-card-border text-white placeholder:text-muted-foreground"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading || !selectedPlatform || !selectedDocumentId}
              className="bg-htd-purple hover:bg-htd-purple-dark text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-white"
              onClick={() => router.push("/admin/posts")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
