"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPost, getDocumentsList } from "../../actions";
import { toast } from "sonner";

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "x", label: "X" },
  { value: "youtube", label: "YouTube" },
];

type DocumentOption = { id: string; title: string };

export default function NewPostPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [documentsList, setDocumentsList] = useState<DocumentOption[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState("");

  useEffect(() => {
    async function loadDocuments() {
      const res = await getDocumentsList();
      if (res.data) setDocumentsList(res.data);
    }
    loadDocuments();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("platform", selectedPlatform);
    formData.set("documentId", selectedDocumentId);

    const result = await createPost(formData);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Post created successfully!");
      router.push("/admin/posts");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Add Post</h1>
        <p className="text-muted-foreground mt-1">
          Track a social media post promoting one of your lead magnets
        </p>
      </div>

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
              {!selectedPlatform && (
                <p className="text-xs text-muted-foreground">
                  Select the platform this post was published on
                </p>
              )}
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
                {documentsList.map((doc) => (
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
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                    >
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
                    Creating...
                  </span>
                ) : (
                  "Create Post"
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
    </div>
  );
}
