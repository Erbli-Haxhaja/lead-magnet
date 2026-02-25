"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadDocument } from "../actions";
import { toast } from "sonner";

export default function UploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("file", selectedFile);

    const result = await uploadDocument(formData);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Document uploaded successfully!");
      router.push("/admin/documents");
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Upload Document</h1>
        <p className="text-muted-foreground mt-1">
          Upload a new document to create a lead magnet
        </p>
      </div>

      <Card className="bg-htd-card border-htd-card-border">
        <CardHeader>
          <CardTitle className="text-white text-lg">Document Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-muted-foreground">
                Title <span className="text-red-400">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. The Ultimate Guide to Digital Marketing"
                required
                className="bg-[#0a0e1a] border-htd-card-border focus:border-htd-purple"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-muted-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="A brief description of what the reader will learn..."
                rows={3}
                className="bg-[#0a0e1a] border-htd-card-border focus:border-htd-purple resize-none"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">
                File <span className="text-red-400">*</span>
              </Label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
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
                  name="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt,.csv"
                />
                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-htd-green/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-htd-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {formatFileSize(selectedFile.size)} · {selectedFile.type || "Unknown type"}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-htd-purple/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-htd-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    <p className="text-white">
                      Drag & drop your file here, or{" "}
                      <span className="text-htd-purple-light">browse</span>
                    </p>
                    <p className="text-muted-foreground text-xs">
                      PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, ZIP, TXT, CSV — Max 25MB
                    </p>
                  </div>
                )}
              </div>
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
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  "Upload Document"
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
    </div>
  );
}
