"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { createEmailTemplate } from "../../actions";
import { toast } from "sonner";

const PLACEHOLDERS = [
  {
    tag: "{{document_title}}",
    description: "The title of the document",
  },
  {
    tag: "{{document_description}}",
    description: "The document description",
  },
  {
    tag: "{{sender_name}}",
    description: "The sender's display name",
  },
  {
    tag: "{{sender_email}}",
    description: "The sender's email address",
  },
];

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0e1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:48px;height:48px;background:linear-gradient(135deg,#7c3aed,#5b21b6);border-radius:12px;line-height:48px;font-size:20px;font-weight:bold;color:white;">H</div>
      <p style="color:#a78bfa;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-top:12px;font-weight:600;">HTD Solutions</p>
    </div>
    <div style="background-color:#111827;border:1px solid #2a2f3e;border-radius:16px;padding:40px 32px;text-align:center;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#7c3aed20,#10b98120);border-radius:16px;margin:0 auto 24px;line-height:64px;">
        <span style="font-size:32px;">📄</span>
      </div>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 8px;">Here's your document!</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 24px;line-height:1.6;">
        Thank you for your interest. Your requested document <strong style="color:#a78bfa;">"{{document_title}}"</strong> is attached to this email.
      </p>
      <div style="background:linear-gradient(135deg,#7c3aed15,#10b98115);border:1px solid #7c3aed30;border-radius:12px;padding:16px;margin-bottom:8px;">
        <p style="color:#10b981;font-size:14px;font-weight:600;margin:0 0 4px;">📎 File attached below</p>
        <p style="color:#94a3b8;font-size:12px;margin:0;">Check the attachment to access your document</p>
      </div>
    </div>
    <div style="text-align:center;margin-top:32px;">
      <p style="color:#4a5568;font-size:12px;margin:0;">
        Sent by <span style="color:#a78bfa;">{{sender_name}}</span>
      </p>
    </div>
  </div>
</body>
</html>`;

const DEFAULT_TEXT = `<p>Hi there,</p><p>Thank you for your interest! Your requested document <b>"{{document_title}}"</b> is attached to this email.</p><p>Please find it in the attachments below.</p><p>Best regards,<br>{{sender_name}}</p>`;

function textToPreviewHtml(html: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>p{margin:0;}</style></head>
<body style="margin:0;padding:0;background-color:#f6f9fc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:32px;color:#1a202c;font-size:15px;line-height:1.7;">
${html}
    </div>
  </div>
</body></html>`;
}

export default function NewEmailTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState(
    "Your free resource: {{document_title}}"
  );
  const [bodyFormat, setBodyFormat] = useState<"html" | "text">("html");
  const [htmlBody, setHtmlBody] = useState(DEFAULT_HTML);
  const [textBody, setTextBody] = useState(DEFAULT_TEXT);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  const body = bodyFormat === "html" ? htmlBody : textBody;

  function applyPlaceholders(str: string) {
    return str
      .replace(
        /\{\{document_title\}\}/g,
        "The Ultimate Guide to Digital Marketing"
      )
      .replace(
        /\{\{document_description\}\}/g,
        "A comprehensive guide covering all aspects of modern digital marketing strategies."
      )
      .replace(/\{\{sender_name\}\}/g, "HTD Solutions")
      .replace(/\{\{sender_email\}\}/g, "info@htd.solutions");
  }

  function getPreviewHtml() {
    if (bodyFormat === "text") {
      return textToPreviewHtml(applyPlaceholders(textBody));
    }
    return applyPlaceholders(htmlBody);
  }

  function handleFormatChange(fmt: "html" | "text") {
    if (fmt === bodyFormat) return;
    setBodyFormat(fmt);
    setActiveTab("edit");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || !body.trim()) {
      toast.error("All fields are required");
      return;
    }
    setSaving(true);
    const result = await createEmailTemplate(
      name.trim(),
      subject.trim(),
      body,
      bodyFormat
    );
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Email template created!");
      router.push("/admin/emails");
    }
    setSaving(false);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">New Email Template</h1>
        <p className="text-muted-foreground mt-1">
          Design the email that will be sent with your lead magnet documents
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form fields */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-htd-card border-htd-card-border">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Template Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Template Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Default Lead Magnet Email"
                    required
                    className="bg-[#0a0e1a] border-htd-card-border focus:border-htd-purple"
                  />
                  <p className="text-xs text-muted-foreground">
                    Internal name — not shown to recipients
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">
                    Subject Line <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Your free resource: {{document_title}}"
                    required
                    className="bg-[#0a0e1a] border-htd-card-border focus:border-htd-purple"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supports placeholders — e.g.{" "}
                    <code className="text-htd-purple-light">
                      {"{{document_title}}"}
                    </code>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-htd-card border-htd-card-border">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-white text-lg">
                      Email Body
                    </CardTitle>
                    {/* Format toggle */}
                    <div className="flex rounded-lg border border-htd-card-border overflow-hidden">
                      <button
                        type="button"
                        onClick={() => handleFormatChange("text")}
                        className={`px-3 py-1 text-xs font-medium transition-colors ${
                          bodyFormat === "text"
                            ? "bg-htd-purple/20 text-htd-purple-light"
                            : "bg-[#0a0e1a] text-muted-foreground hover:text-white"
                        }`}
                      >
                        Plain Text
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFormatChange("html")}
                        className={`px-3 py-1 text-xs font-medium transition-colors border-l border-htd-card-border ${
                          bodyFormat === "html"
                            ? "bg-htd-purple/20 text-htd-purple-light"
                            : "bg-[#0a0e1a] text-muted-foreground hover:text-white"
                        }`}
                      >
                        HTML
                      </button>
                    </div>
                  </div>
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-auto"
                  >
                    <TabsList className="bg-[#0a0e1a] border border-htd-card-border">
                      <TabsTrigger
                        value="edit"
                        className="data-[state=active]:bg-htd-purple/20 data-[state=active]:text-htd-purple-light text-xs"
                      >
                        Edit
                      </TabsTrigger>
                      <TabsTrigger
                        value="preview"
                        className="data-[state=active]:bg-htd-purple/20 data-[state=active]:text-htd-purple-light text-xs"
                      >
                        Preview
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === "edit" ? (
                  bodyFormat === "html" ? (
                    <Textarea
                      value={htmlBody}
                      onChange={(e) => setHtmlBody(e.target.value)}
                      placeholder="Paste your HTML email template here..."
                      rows={24}
                      className="bg-[#0a0e1a] border-htd-card-border focus:border-htd-purple font-mono text-xs resize-none"
                      required
                    />
                  ) : (
                    <RichTextEditor
                      value={textBody}
                      onChange={setTextBody}
                      placeholder="Write your email body here. Use the toolbar to format text..."
                    />
                  )
                ) : (
                  <div className="bg-white rounded-lg overflow-hidden">
                    <iframe
                      srcDoc={getPreviewHtml()}
                      className="w-full h-[600px] border-0"
                      title="Email preview"
                      sandbox=""
                    />
                  </div>
                )}
                {bodyFormat === "text" && activeTab === "edit" && (
                  <p className="text-xs text-muted-foreground mt-2">
                    ✨ Rich text mode — format your text with the toolbar. The output will be clean HTML with no colors or styling, just text formatting.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Placeholders & Actions */}
          <div className="space-y-6">
            <Card className="bg-htd-card border-htd-card-border">
              <CardHeader>
                <CardTitle className="text-white text-sm">
                  Available Placeholders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Click to copy. These will be replaced with actual values when
                  the email is sent.
                </p>
                {PLACEHOLDERS.map((p) => (
                  <button
                    key={p.tag}
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(p.tag);
                      toast.success(`Copied ${p.tag}`);
                    }}
                    className="w-full text-left p-3 rounded-lg bg-[#0a0e1a] border border-htd-card-border hover:border-htd-purple/30 transition-colors"
                  >
                    <code className="text-htd-purple-light text-xs font-semibold">
                      {p.tag}
                    </code>
                    <p className="text-muted-foreground text-xs mt-1">
                      {p.description}
                    </p>
                  </button>
                ))}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={saving}
                className="bg-htd-purple hover:bg-htd-purple-dark text-white w-full"
              >
                {saving ? (
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
                  "Create Template"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/emails")}
                className="border-htd-card-border text-muted-foreground hover:text-white hover:bg-white/5 w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
