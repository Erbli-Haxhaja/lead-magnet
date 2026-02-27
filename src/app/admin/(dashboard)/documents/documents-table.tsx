"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toggleDocumentActive, deleteDocument } from "../actions";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

type DocumentWithStats = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isActive: boolean;
  createdAt: Date;
  views: number;
  emailsSent: number;
  delivered: number;
  senderName: string | null;
  templateName: string | null;
};

export function DocumentsTable({
  documents,
}: {
  documents: DocumentWithStats[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function getFileIcon(type: string) {
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("sheet") || type.includes("excel")) return "📊";
    if (type.includes("presentation") || type.includes("powerpoint"))
      return "📑";
    if (type.includes("zip") || type.includes("archive")) return "📦";
    return "📎";
  }

  async function handleToggle(id: string, newValue: boolean) {
    setLoadingId(id);
    const result = await toggleDocumentActive(id, newValue);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(newValue ? "Document activated" : "Document deactivated");
      router.refresh();
    }
    setLoadingId(null);
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setLoadingId(id);
    const result = await deleteDocument(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Document deleted");
      router.refresh();
    }
    setLoadingId(null);
  }

  function copyLink(slug: string) {
    const url = `${window.location.origin}/d/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  }

  if (documents.length === 0) {
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-white text-lg font-semibold mb-1">
          No documents yet
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          Upload your first document to start capturing leads
        </p>
        <Link href="/admin/upload">
          <Button className="bg-htd-purple hover:bg-htd-purple-dark text-white">
            Upload Document
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-htd-card border border-htd-card-border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-htd-card-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Document</TableHead>
            <TableHead className="text-muted-foreground">Views</TableHead>
            <TableHead className="text-muted-foreground">Sent</TableHead>
            <TableHead className="text-muted-foreground">Delivered</TableHead>
            <TableHead className="text-muted-foreground">Active</TableHead>
            <TableHead className="text-muted-foreground text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow
              key={doc.id}
              className="border-htd-card-border hover:bg-white/[0.02]"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {getFileIcon(doc.fileType)}
                  </span>
                  <div>
                    <p className="text-white font-medium">{doc.title}</p>
                    <p className="text-muted-foreground text-xs">
                      {doc.fileName} · {formatFileSize(doc.fileSize)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {doc.senderName && (
                        <span className="text-[10px] text-htd-purple-light bg-htd-purple/10 px-1.5 py-0.5 rounded">
                          📤 {doc.senderName.split(" <")[0]}
                        </span>
                      )}
                      {doc.templateName && (
                        <span className="text-[10px] text-htd-purple-light bg-htd-purple/10 px-1.5 py-0.5 rounded">
                          ✉️ {doc.templateName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-white font-medium">{doc.views}</span>
              </TableCell>
              <TableCell>
                <span className="text-white font-medium">
                  {doc.emailsSent}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-htd-green font-medium">
                    {doc.delivered}
                  </span>
                  {doc.emailsSent > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] border-htd-green/30 text-htd-green"
                    >
                      {Math.round((doc.delivered / doc.emailsSent) * 100)}%
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Switch
                  checked={doc.isActive}
                  onCheckedChange={(checked) => handleToggle(doc.id, checked)}
                  disabled={loadingId === doc.id}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center gap-1 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyLink(doc.slug)}
                    className="text-muted-foreground hover:text-htd-purple-light hover:bg-htd-purple/10"
                    title="Copy shareable link"
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
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                  </Button>
                  <Link href={`/admin/documents/${doc.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-htd-purple-light hover:bg-htd-purple/10"
                      title="Edit document"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id, doc.title)}
                    disabled={loadingId === doc.id}
                    className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                    title="Delete document"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
