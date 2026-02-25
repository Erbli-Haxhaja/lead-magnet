"use client";

import { useState, useMemo } from "react";
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
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState<string | null>(null);

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

  function exportCSV() {
    const headers = ["Email", "Source Document", "Captured At"];
    const rows = filtered.map((lead) => [
      lead.email,
      lead.documentTitle || lead.source || "",
      new Date(lead.capturedAt).toISOString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
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

        <Button
          onClick={exportCSV}
          variant="outline"
          size="sm"
          className="border-htd-card-border text-muted-foreground hover:text-white hover:bg-white/5 ml-auto"
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
          Export CSV
        </Button>
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
              {filtered.map((lead) => (
                <TableRow
                  key={lead.id}
                  className="border-htd-card-border hover:bg-white/[0.02]"
                >
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
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground text-sm">
                      {new Date(lead.capturedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
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
