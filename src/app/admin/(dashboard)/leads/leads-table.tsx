"use client";

import { useState, useMemo, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteLeads } from "../actions";

type LeadRow = {
  id: string;
  email: string;
  source: string | null;
  capturedAt: Date;
  documentTitle: string | null;
};

type DocSlug = {
  slug: string;
  title: string;
};

export function LeadsTable({
  leads,
  documentSlugs,
}: {
  leads: LeadRow[];
  documentSlugs: DocSlug[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState<"all" | "selected" | null>(null);

  // Close export menu on outside click
  useEffect(() => {
    if (!showExportMenu) return;
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest("[data-export-menu]")) {
        setShowExportMenu(null);
      }
    };
    document.addEventListener("click", handler, { capture: true });
    return () => document.removeEventListener("click", handler, { capture: true });
  }, [showExportMenu]);

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch = lead.email
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesSource = filterSource
        ? lead.source === filterSource
        : true;
      return matchesSearch && matchesSource;
    });
  }, [leads, search, filterSource]);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((l) => selected.has(l.id));
  const someSelected = selected.size > 0;

  function toggleSelectAll() {
    if (allFilteredSelected) {
      // Deselect all filtered
      const newSelected = new Set(selected);
      filtered.forEach((l) => newSelected.delete(l.id));
      setSelected(newSelected);
    } else {
      // Select all filtered
      const newSelected = new Set(selected);
      filtered.forEach((l) => newSelected.add(l.id));
      setSelected(newSelected);
    }
  }

  function toggleSelect(id: string) {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  }

  function exportCSV(onlySelected: boolean, mode: "all-data" | "emails-only") {
    const data = onlySelected
      ? filtered.filter((l) => selected.has(l.id))
      : filtered;

    // Deduplicate by email
    const seen = new Set<string>();
    const unique = data.filter((lead) => {
      const email = lead.email.toLowerCase();
      if (seen.has(email)) return false;
      seen.add(email);
      return true;
    });

    let csv: string;
    if (mode === "emails-only") {
      csv = ["Email", ...unique.map((l) => `"${l.email}"`)].join("\n");
    } else {
      const headers = ["Email", "Source Document", "Captured At"];
      const rows = unique.map((lead) => [
        `"${lead.email}"`,
        `"${lead.documentTitle || lead.source || ""}"`,
        new Date(lead.capturedAt).toISOString(),
      ]);
      csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${mode === "emails-only" ? "emails-" : ""}${onlySelected ? "selected-" : ""}${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(null);
  }

  function handleDelete() {
    const ids = Array.from(selected);
    startTransition(async () => {
      const result = await deleteLeads(ids);
      if (result.error) {
        alert(result.error);
      } else {
        setSelected(new Set());
        setShowDeleteConfirm(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Selection toolbar */}
      {someSelected && (
        <div className="flex items-center gap-3 px-4 py-3 bg-htd-purple/10 border border-htd-purple/20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="text-sm text-htd-purple-light font-medium">
            {selected.size} lead{selected.size !== 1 ? "s" : ""} selected
          </span>
          <div className="h-4 w-px bg-htd-purple/20" />
          <div className="relative" data-export-menu>
            <Button
              onClick={() => setShowExportMenu(showExportMenu === "selected" ? null : "selected")}
              variant="ghost"
              size="sm"
              className="text-htd-purple-light hover:text-white hover:bg-htd-purple/20 h-8"
            >
              <svg
                className="w-4 h-4 mr-1.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export Selected
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Button>
            {showExportMenu === "selected" && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-htd-card border border-htd-card-border rounded-lg shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                <button
                  onClick={() => exportCSV(true, "all-data")}
                  className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                >
                  Export all data
                </button>
                <button
                  onClick={() => exportCSV(true, "emails-only")}
                  className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
                >
                  Export only emails
                </button>
              </div>
            )}
          </div>
          {!showDeleteConfirm ? (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8"
            >
              <svg
                className="w-4 h-4 mr-1.5"
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
              Delete Selected
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">Are you sure?</span>
              <Button
                onClick={handleDelete}
                variant="ghost"
                size="sm"
                disabled={isPending}
                className="text-red-400 hover:text-white hover:bg-red-500/20 h-8 text-xs"
              >
                {isPending ? "Deleting…" : "Yes, delete"}
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-white h-8 text-xs"
              >
                Cancel
              </Button>
            </div>
          )}
          <button
            onClick={() => {
              setSelected(new Set());
              setShowDeleteConfirm(false);
            }}
            className="ml-auto text-muted-foreground hover:text-white transition-colors"
            title="Clear selection"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-htd-card border-htd-card-border focus:border-htd-purple"
          />
        </div>

        {/* Document filter */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterSource(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !filterSource
                ? "bg-htd-purple/15 text-htd-purple-light border border-htd-purple/20"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            }`}
          >
            All
          </button>
          {documentSlugs.map((doc) => (
            <button
              key={doc.slug}
              onClick={() =>
                setFilterSource(filterSource === doc.slug ? null : doc.slug)
              }
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all truncate max-w-[150px] ${
                filterSource === doc.slug
                  ? "bg-htd-purple/15 text-htd-purple-light border border-htd-purple/20"
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              }`}
            >
              {doc.title}
            </button>
          ))}
        </div>

        <div className="relative ml-auto" data-export-menu>
          <Button
            onClick={() => setShowExportMenu(showExportMenu === "all" ? null : "all")}
            variant="outline"
            size="sm"
            className="border-htd-card-border text-muted-foreground hover:text-white hover:bg-white/5"
          >
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export
            <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Button>
          {showExportMenu === "all" && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-htd-card border border-htd-card-border rounded-lg shadow-xl z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={() => exportCSV(false, "all-data")}
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
              >
                Export all data
              </button>
              <button
                onClick={() => exportCSV(false, "emails-only")}
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
              >
                Export only emails
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-htd-card border border-htd-card-border rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-htd-purple/10 flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6 text-htd-purple-light"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <p className="text-white font-medium">No leads found</p>
            <p className="text-muted-foreground text-sm mt-1">
              {search || filterSource
                ? "Try adjusting your filters"
                : "Leads will appear here when users submit their emails"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-htd-card-border hover:bg-transparent">
                <TableHead className="w-10">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={allFilteredSelected}
                    onClick={toggleSelectAll}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 cursor-pointer ${
                      allFilteredSelected
                        ? "bg-htd-purple border-htd-purple shadow-[0_0_6px_rgba(124,58,237,0.4)]"
                        : "border-[#4a5068] bg-white/5 hover:border-htd-purple-light"
                    }`}
                  >
                    {allFilteredSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">
                  Document
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Captured
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((lead) => {
                const isSelected = selected.has(lead.id);
                return (
                  <TableRow
                    key={lead.id}
                    className={`border-htd-card-border cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-htd-purple/5 hover:bg-htd-purple/10"
                        : "hover:bg-white/[0.02]"
                    }`}
                    onClick={() => toggleSelect(lead.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isSelected}
                        onClick={() => toggleSelect(lead.id)}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? "bg-htd-purple border-htd-purple shadow-[0_0_6px_rgba(124,58,237,0.4)]"
                            : "border-[#4a5068] bg-white/5 hover:border-htd-purple-light"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </TableCell>
                    <TableCell>
                      <span className="text-white font-medium">
                        {lead.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      {lead.documentTitle ? (
                        <Badge
                          variant="outline"
                          className="border-htd-purple/30 text-htd-purple-light text-xs"
                        >
                          {lead.documentTitle}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {new Date(lead.capturedAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-muted-foreground text-xs text-center">
          Showing {filtered.length} of {leads.length} leads
        </p>
      )}
    </div>
  );
}
