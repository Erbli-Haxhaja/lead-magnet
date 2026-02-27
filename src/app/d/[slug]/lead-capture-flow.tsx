"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitLeadEmail, confirmDelivery } from "./actions";

type Step = "email" | "confirmation" | "success";

export function LeadCaptureFlow({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<string | null>(null);
  const [emailSendId, setEmailSendId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Poll for delivery status via SSE
  useEffect(() => {
    if (!emailSendId || step !== "confirmation") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/delivery-status?emailId=${emailSendId}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.status === "delivered") {
            setDeliveryStatus("delivered");
            clearInterval(interval);
          } else if (
            data.status === "bounced" ||
            data.status === "failed"
          ) {
            setDeliveryStatus("failed");
            clearInterval(interval);
          }
        }
      } catch {
        // Silently continue polling
      }
    }, 3000);

    // Stop polling after 2 minutes
    const timeout = setTimeout(() => clearInterval(interval), 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [emailSendId, step]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await submitLeadEmail(slug, email);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setEmailSendId(result.emailSendId || null);
    setStep("confirmation");
    setLoading(false);
  }

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const newEmail = editEmail || email;
    const result = await submitLeadEmail(slug, newEmail);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setEmail(newEmail);
    setEditEmail("");
    setShowEditForm(false);
    setEmailSendId(result.emailSendId || null);
    setDeliveryStatus(null);
    setLoading(false);
  }

  // ─── Step 1: Email Form ────────────────────────────────────
  if (step === "email") {
    return (
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <Input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="pl-10 h-12 bg-[#0a0e1a] border-htd-card-border focus:border-htd-purple text-white placeholder:text-muted-foreground"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-htd-purple to-htd-purple-dark hover:from-htd-purple-dark hover:to-htd-purple text-white font-semibold text-base transition-all duration-300 glow-purple"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Send me the document
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </span>
            )}
          </Button>
        </form>

        <p className="text-center text-muted-foreground text-xs mt-4">
          We&apos;ll send the document directly to your inbox.
        </p>
      </div>
    );
  }

  // ─── Step 2: Confirmation ──────────────────────────────────
  if (step === "confirmation") {
    return (
      <div className="text-center space-y-6">
        {/* Status icon */}
        <div className="relative inline-block">
          {deliveryStatus === "delivered" ? (
            <div className="w-16 h-16 rounded-full bg-htd-green/10 flex items-center justify-center mx-auto glow-green">
              <svg
                className="w-8 h-8 text-htd-green"
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
          ) : deliveryStatus === "failed" ? (
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-red-400"
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
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-htd-purple/10 flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-htd-purple-light animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Status text */}
        <div>
          {deliveryStatus === "delivered" ? (
            <>
              <h2 className="text-xl font-bold text-white mb-2">
                Delivered! 🎉
              </h2>
              <p className="text-muted-foreground text-sm">
                The document was successfully sent to
              </p>
            </>
          ) : deliveryStatus === "failed" ? (
            <>
              <h2 className="text-xl font-bold text-white mb-2">
                Delivery Failed
              </h2>
              <p className="text-muted-foreground text-sm">
                We couldn&apos;t deliver to this address. Please check and try again.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white mb-2">
                Check your inbox!
              </h2>
              <p className="text-muted-foreground text-sm">
                We&apos;re sending the document to
              </p>
            </>
          )}
          <p className="text-htd-purple-light font-medium mt-1">{email}</p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {deliveryStatus !== "failed" && (
            <Button
              onClick={async () => {
                if (emailSendId) {
                  await confirmDelivery(emailSendId);
                }
                setStep("success");
              }}
              className="w-full bg-htd-green hover:bg-htd-green/90 text-white font-medium"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Yes, I got it!
            </Button>
          )}

          {!showEditForm ? (
            <button
              onClick={() => {
                setShowEditForm(true);
                setEditEmail(email);
              }}
              className="text-sm text-muted-foreground hover:text-htd-purple-light transition-colors"
            >
              {deliveryStatus === "failed"
                ? "✏️ Fix my email and try again"
                : "❌ Didn't get it? Fix my email"}
            </button>
          ) : (
            <form
              onSubmit={handleResend}
              className="space-y-3 bg-[#0a0e1a] rounded-xl p-4 border border-htd-card-border"
            >
              <p className="text-sm text-muted-foreground">
                Enter the correct email address:
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="bg-htd-card border-htd-card-border focus:border-htd-purple text-white"
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-htd-purple hover:bg-htd-purple-dark text-white shrink-0"
                >
                  {loading ? (
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
                  ) : (
                    "Resend"
                  )}
                </Button>
              </div>
              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowEditForm(false);
                  setError("");
                }}
                className="text-xs text-muted-foreground hover:text-white transition-colors"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ─── Step 3: Success ───────────────────────────────────────
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-htd-green/10 flex items-center justify-center mx-auto glow-green">
        <svg
          className="w-10 h-10 text-htd-green"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Enjoy your document! 🎉
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Thank you for your interest. We hope you find the resource valuable.
        </p>
      </div>

      {/* Social follow CTA */}
      <div className="bg-[#0a0e1a] rounded-xl p-5 border border-htd-card-border">
        <p className="text-sm text-muted-foreground mb-3">
          Follow us for more valuable resources
        </p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="https://linkedin.com/company/htd-solutions"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-lg bg-htd-card border border-htd-card-border flex items-center justify-center text-muted-foreground hover:text-htd-purple-light hover:border-htd-purple/30 transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a
            href="https://instagram.com/htdsolutions"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-lg bg-htd-card border border-htd-card-border flex items-center justify-center text-muted-foreground hover:text-htd-purple-light hover:border-htd-purple/30 transition-all"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
