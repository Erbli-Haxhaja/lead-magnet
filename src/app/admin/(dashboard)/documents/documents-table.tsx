"use client";

import { useState, Fragment } from "react";
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
import { toggleDocumentActive, deleteDocument, resetDocumentStats } from "../actions";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PostBreakdown = {
  postId: string | null;
  postName: string;
  platform: string;
  views: number;
  emailsSent: number;
  delivered: number;
};

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
  postBreakdowns: PostBreakdown[];
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
  direct: {
    label: "Direct Link",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/30",
  },
};

export function DocumentsTable({
  documents,
}: {
  documents: DocumentWithStats[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  async function handleReset(id: string, title: string) {
    if (
      !confirm(
        `Are you sure you want to reset all statistics for "${title}"?\n\nThis will delete all views, email sends, and leads associated with this document. This action cannot be undone.`
      )
    )
      return;

    setLoadingId(id);
    const result = await resetDocumentStats(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Statistics reset successfully");
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
            <Fragment key={doc.id}>
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
                <button
                  onClick={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
                  className="text-white font-medium hover:text-htd-purple-light transition-colors flex items-center gap-1.5"
                  title={doc.postBreakdowns.length > 0 ? "Click to see per-post breakdown" : undefined}
                >
                  {doc.views}
                  {doc.postBreakdowns.length > 0 && (
                    <svg
                      className={`w-3 h-3 text-muted-foreground transition-transform ${expandedId === doc.id ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
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
                    onClick={() => handleReset(doc.id, doc.title)}
                    disabled={loadingId === doc.id}
                    className="text-muted-foreground hover:text-orange-400 hover:bg-orange-500/10"
                    title="Reset statistics"
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </Button>
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
            {/* Per-post breakdown rows */}
            {expandedId === doc.id && doc.postBreakdowns.length > 0 && (
              <TableRow className="border-htd-card-border bg-[#0a0e1a]/50 hover:bg-[#0a0e1a]/50">
                <TableCell colSpan={6} className="p-0">
                  <div className="px-6 py-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Per-Post Breakdown</p>
                    <div className="space-y-1.5">
                      {doc.postBreakdowns.map((bp, idx) => {
                        const pConfig = PLATFORM_CONFIG[bp.platform] || PLATFORM_CONFIG.organic;
                        return (
                          <div
                            key={bp.postId ?? `organic-${idx}`}
                            className="flex items-center gap-4 text-sm py-1.5 px-3 rounded-lg bg-htd-card/50"
                          >
                            <Badge
                              variant="outline"
                              className={`${pConfig.bg} ${pConfig.color} text-[10px] min-w-[80px] justify-center`}
                            >
                              {pConfig.label}
                            </Badge>
                            <span className="text-white text-xs font-medium flex-1 truncate">
                              {bp.postName}
                            </span>
                            <div className="flex items-center gap-6 text-xs">
                              <span className="text-muted-foreground">
                                <span className="text-white font-medium">{bp.views}</span> views
                              </span>
                              <span className="text-muted-foreground">
                                <span className="text-white font-medium">{bp.emailsSent}</span> sent
                              </span>
                              <span className="text-muted-foreground">
                                <span className="text-htd-green font-medium">{bp.delivered}</span> delivered
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
