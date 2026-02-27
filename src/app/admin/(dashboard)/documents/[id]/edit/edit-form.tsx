"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateDocument } from "../../../actions";
import { toast } from "sonner";

type DocumentData = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isActive: boolean;
  senderId: string | null;
  emailTemplateId: string | null;
  createdAt: Date;
};

type Sender = { id: string; name: string; email: string };
type EmailTemplate = { id: string; name: string; subject: string };

export function EditDocumentForm({
  document: doc,
  senders,
  templates,
}: {
  document: DocumentData;
  senders: Sender[];
  templates: EmailTemplate[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(doc.title);
  const [description, setDescription] = useState(doc.description || "");
  const [selectedSenderId, setSelectedSenderId] = useState(
    doc.senderId || ""
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    doc.emailTemplateId || ""
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("description", description);
    if (selectedSenderId) formData.set("senderId", selectedSenderId);
    if (selectedTemplateId)
      formData.set("emailTemplateId", selectedTemplateId);
    if (selectedFile) formData.set("file", selectedFile);

    const result = await updateDocument(doc.id, formData);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Document updated!");
      router.push("/admin/documents");
    }
  }

  return (
    <Card className="bg-htd-card border-htd-card-border">
      <CardHeader>
        <CardTitle className="text-white text-lg">Document Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              Title <span className="text-red-400">*</span>
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Ultimate Guide to Digital Marketing"
              required
              className="bg-[#0a0e1a] border-htd-card-border focus:border-htd-purple"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of what the reader will learn..."
              rows={3}
              className="bg-[#0a0e1a] border-htd-card-border focus:border-htd-purple resize-none"
            />
          </div>

          {/* Sender & Email Template selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Sender</Label>
              <select
                value={selectedSenderId}
                onChange={(e) => setSelectedSenderId(e.target.value)}
                className="w-full h-10 rounded-md border border-htd-card-border bg-[#0a0e1a] px-3 text-sm text-white focus:border-htd-purple focus:outline-none"
              >
                <option value="">Default (env variable)</option>
                {senders.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} &lt;{s.email}&gt;
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Who the email will be sent from
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email Template</Label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full h-10 rounded-md border border-htd-card-border bg-[#0a0e1a] px-3 text-sm text-white focus:border-htd-purple focus:outline-none"
              >
                <option value="">Default built-in template</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                The email body sent with the document
              </p>
            </div>
          </div>

          {/* Replace file (optional) */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              Replace File{" "}
              <span className="text-muted-foreground/60">(optional)</span>
            </Label>

            {/* Current file info */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#0a0e1a] border border-htd-card-border">
              <div className="w-9 h-9 rounded-lg bg-htd-purple/10 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-htd-purple-light"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium truncate">
                  {doc.fileName}
                </p>
                <p className="text-muted-foreground text-xs">
                  {formatFileSize(doc.fileSize)} · Current file
                </p>
              </div>
            </div>

            {/* Drop zone for replacement */}
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
                dragActive
                  ? "border-htd-purple bg-htd-purple/5"
                  : selectedFile
                    ? "border-htd-green/50 bg-htd-green/5"
                    : "border-htd-card-border hover:border-htd-purple/50 hover:bg-white/[0.02]"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.csv"
              />
              {selectedFile ? (
                <div className="space-y-1">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-htd-green/10 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-htd-green"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-white text-sm font-medium">
                    {selectedFile.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatFileSize(selectedFile.size)} · Will replace current
                    file
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Cancel replacement
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="w-10 h-10 mx-auto rounded-lg bg-white/5 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Drop a new file to replace, or{" "}
                    <span className="text-htd-purple-light">browse</span>
                  </p>
                  <p className="text-muted-foreground text-[11px]">
                    Leave empty to keep the current file
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Slug (read-only info) */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Shareable Link</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-10 rounded-md border border-htd-card-border bg-[#0a0e1a] px-3 flex items-center text-sm text-muted-foreground overflow-hidden">
                <span className="truncate">/d/{doc.slug}</span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/d/${doc.slug}`
                  );
                  toast.success("Link copied!");
                }}
                className="border-htd-card-border text-muted-foreground hover:text-white hover:bg-white/5 shrink-0"
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
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The slug cannot be changed after creation
            </p>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading}
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
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/documents")}
              className="border-htd-card-border text-muted-foreground hover:text-white hover:bg-white/5"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
