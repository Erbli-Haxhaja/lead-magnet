"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getEmailTemplates,
  deleteEmailTemplate,
} from "../actions";
import { toast } from "sonner";
import Link from "next/link";

type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  bodyFormat: string;
  htmlBody: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function EmailTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadTemplates() {
    const result = await getEmailTemplates();
    if (result.data) {
      setTemplates(result.data);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  async function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `Delete template "${name}"? Documents using this template will fall back to the default email.`
      )
    )
      return;
    setDeletingId(id);
    const result = await deleteEmailTemplate(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Template deleted");
      await loadTemplates();
    }
    setDeletingId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Email Templates</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage email templates for your lead magnets
          </p>
        </div>
        <Link href="/admin/emails/new">
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
            New Template
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="bg-htd-card border border-htd-card-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-white text-lg font-semibold mb-1">
            No email templates yet
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create a custom email template to send with your lead magnets
          </p>
          <Link href="/admin/emails/new">
            <Button className="bg-htd-purple hover:bg-htd-purple-dark text-white">
              Create Template
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="bg-htd-card border-htd-card-border hover:border-htd-purple/30 transition-colors"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-htd-purple/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-5 h-5 text-htd-purple-light"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold text-base">
                          {template.name}
                        </h3>
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            template.bodyFormat === "text"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-htd-purple/10 text-htd-purple-light border border-htd-purple/20"
                          }`}
                        >
                          {template.bodyFormat === "text"
                            ? "Plain Text"
                            : "HTML"}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm mt-0.5">
                        Subject:{" "}
                        <span className="text-htd-purple-light">
                          {template.subject}
                        </span>
                      </p>
                      <p className="text-muted-foreground text-xs mt-2">
                        Updated{" "}
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Link href={`/admin/emails/${template.id}/edit`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-htd-purple-light hover:bg-htd-purple/10"
                        title="Edit template"
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
                      onClick={() => handleDelete(template.id, template.name)}
                      disabled={deletingId === template.id}
                      className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                      title="Delete template"
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
