import { db } from "@/db";
import { documents, documentViews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { LeadCaptureFlow } from "./lead-capture-flow";
import type { Metadata } from "next";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.slug, slug))
    .limit(1);

  if (!doc) return { title: "Document Not Found" };

  return {
    title: `${doc.title} - HTD Solutions`,
    description: doc.description || `Get your free copy of "${doc.title}"`,
  };
}

export default async function LeadMagnetPage({ params }: PageProps) {
  const { slug } = await params;

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.slug, slug))
    .limit(1);

  if (!doc || !doc.isActive) {
    notFound();
  }

  // Track page view
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || "unknown";

  await db.insert(documentViews).values({
    documentId: doc.id,
    ipAddress: ip,
  });

  return (
    <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-htd-purple/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-htd-green/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-htd-card/50 border border-htd-card-border backdrop-blur-sm">
            <img src="/htd_logo.png" alt="HTD Solutions" className="w-7 h-7 rounded-lg object-contain" />
            <span className="text-htd-purple-light text-xs font-semibold tracking-wider uppercase">
              HTD Solutions
            </span>
          </div>
        </div>

        {/* Main card — wide horizontal layout */}
        <div className="w-full max-w-4xl">
          {/* Animated border wrapper */}
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-htd-purple/50 via-htd-card-border to-htd-green/30">
            <div className="bg-htd-card rounded-2xl overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Left 1/3 — Document Preview */}
                <div className="md:w-1/3 bg-gradient-to-br from-[#0d1220] to-[#0a0e1a] border-b md:border-b-0 md:border-r border-htd-card-border p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Subtle pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, rgba(124,58,237,0.4) 1px, transparent 0)`,
                      backgroundSize: "24px 24px",
                    }}
                  />

                  <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Large file icon with glow */}
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-htd-purple/20 rounded-3xl blur-xl scale-110" />
                      <div className="relative w-28 h-36 rounded-2xl bg-gradient-to-br from-htd-card to-[#1a2035] border border-htd-card-border shadow-2xl flex flex-col items-center justify-center">
                        {/* File fold corner */}
                        <div className="absolute top-0 right-0 w-8 h-8 overflow-hidden">
                          <div className="absolute top-0 right-0 w-0 h-0 border-l-[32px] border-l-transparent border-t-[32px] border-t-[#0a0e1a]" />
                          <div className="absolute top-[1px] right-[1px] w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-[#1a2035]" />
                        </div>
                        <span className="text-5xl mb-1">
                          {getDocIcon(doc.fileType)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-htd-purple-light/70 mt-1">
                          {getFileExtension(doc.fileName)}
                        </span>
                      </div>
                      {/* Sparkle decoration */}
                      <div className="absolute -top-2 -right-2 w-5 h-5 text-htd-purple-light animate-pulse">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                        </svg>
                      </div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 text-htd-green/60 animate-pulse [animation-delay:1s]">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
                        </svg>
                      </div>
                    </div>

                    {/* File meta */}
                    <div className="space-y-2">
                      <p className="text-muted-foreground text-xs font-medium">
                        {doc.fileName}
                      </p>
                      <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground/70">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {formatFileSize(doc.fileSize)}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                        <span className="uppercase font-medium">
                          {getFileExtension(doc.fileName)}
                        </span>
                      </div>
                    </div>

                    {/* Decorative lines */}
                    <div className="mt-6 w-full space-y-2 opacity-40">
                      <div className="h-2 bg-white/5 rounded-full w-full" />
                      <div className="h-2 bg-white/5 rounded-full w-4/5 mx-auto" />
                      <div className="h-2 bg-white/5 rounded-full w-full" />
                      <div className="h-2 bg-white/5 rounded-full w-3/5 mx-auto" />
                      <div className="h-2 bg-white/5 rounded-full w-4/5 mx-auto" />
                    </div>
                  </div>
                </div>

                {/* Right 2/3 — Content */}
                <div className="md:w-2/3 p-8 md:p-10">
                  {/* Document info */}
                  <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
                      {doc.title}
                    </h1>

                    {doc.description && (
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                        {doc.description}
                      </p>
                    )}
                  </div>

                  {/* Free badge */}
                  <div className="mb-6 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-htd-green/10 border border-htd-green/20">
                      <svg className="w-4 h-4 text-htd-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-htd-green text-sm font-medium">
                        100% Free · Sent to your inbox
                      </span>
                    </div>
                  </div>

                  {/* Lead capture flow */}
                  <LeadCaptureFlow slug={doc.slug} title={doc.title} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust signals */}
        <div className="mt-8 flex items-center gap-6 text-muted-foreground text-xs">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure & Private
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            No spam, ever
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Instant delivery
          </div>
        </div>
      </div>
    </div>
  );
}

function getDocIcon(type: string): string {
  if (type.includes("pdf")) return "📕";
  if (type.includes("word") || type.includes("document")) return "📘";
  if (type.includes("sheet") || type.includes("excel")) return "📗";
  if (type.includes("presentation") || type.includes("powerpoint")) return "📙";
  if (type.includes("zip") || type.includes("archive")) return "📦";
  return "📄";
}

function getFileExtension(fileName: string): string {
  return fileName.split(".").pop()?.toUpperCase() || "FILE";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
