import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Resources - HTD Solutions",
  description: "Get free documents and resources from HTD Solutions delivered straight to your inbox.",
};

export default function DocumentsLandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-htd-purple/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-htd-green/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px]" />
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

        {/* Main card */}
        <div className="w-full max-w-2xl">
          <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-htd-purple/50 via-htd-card-border to-htd-green/30">
            <div className="bg-htd-card rounded-2xl p-8 md:p-12 text-center">
              {/* Icon */}
              <div className="relative mb-8 inline-block">
                <div className="absolute inset-0 bg-htd-purple/20 rounded-3xl blur-xl scale-125" />
                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-htd-card to-[#1a2035] border border-htd-card-border flex items-center justify-center">
                  <span className="text-4xl">📚</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                Free Resources from <span className="gradient-text">HTD Solutions</span>
              </h1>

              {/* Description */}
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto">
                We share valuable documents, guides, and resources completely free of charge. 
                When you receive a link from us, just enter your email and the document will be 
                delivered straight to your inbox — no downloads needed.
              </p>

              {/* How it works */}
              <div className="grid gap-4 md:grid-cols-3 mb-8">
                <div className="bg-[#0a0e1a] rounded-xl p-5 border border-htd-card-border">
                  <div className="w-10 h-10 rounded-xl bg-htd-purple/10 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-htd-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h3 className="text-white text-sm font-semibold mb-1">Get a Link</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Find our posts on social media with a link to the resource
                  </p>
                </div>

                <div className="bg-[#0a0e1a] rounded-xl p-5 border border-htd-card-border">
                  <div className="w-10 h-10 rounded-xl bg-htd-purple/10 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-htd-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-white text-sm font-semibold mb-1">Enter Your Email</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Provide your email address on the document page
                  </p>
                </div>

                <div className="bg-[#0a0e1a] rounded-xl p-5 border border-htd-card-border">
                  <div className="w-10 h-10 rounded-xl bg-htd-green/10 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-5 h-5 text-htd-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-white text-sm font-semibold mb-1">Check Your Inbox</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    The document is delivered instantly as an email attachment
                  </p>
                </div>
              </div>

              {/* Social CTA */}
              <div className="bg-[#0a0e1a] rounded-xl p-5 border border-htd-card-border">
                <p className="text-sm text-muted-foreground mb-3">
                  Follow us on social media to get notified about new free resources
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <a
                    href="https://www.linkedin.com/company/htd-solutions/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-htd-card border border-htd-card-border flex items-center justify-center text-muted-foreground hover:text-htd-purple-light hover:border-htd-purple/30 transition-all"
                    title="LinkedIn"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/htd_solutions/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-htd-card border border-htd-card-border flex items-center justify-center text-muted-foreground hover:text-htd-purple-light hover:border-htd-purple/30 transition-all"
                    title="Instagram"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.youtube.com/@htd_solutions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-htd-card border border-htd-card-border flex items-center justify-center text-muted-foreground hover:text-htd-purple-light hover:border-htd-purple/30 transition-all"
                    title="YouTube"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.tiktok.com/@htd_solutions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-htd-card border border-htd-card-border flex items-center justify-center text-muted-foreground hover:text-htd-purple-light hover:border-htd-purple/30 transition-all"
                    title="TikTok"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
                    </svg>
                  </a>
                  <a
                    href="https://x.com/htd_solutions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-htd-card border border-htd-card-border flex items-center justify-center text-muted-foreground hover:text-htd-purple-light hover:border-htd-purple/30 transition-all"
                    title="X (Twitter)"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61585974850826"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-htd-card border border-htd-card-border flex items-center justify-center text-muted-foreground hover:text-htd-purple-light hover:border-htd-purple/30 transition-all"
                    title="Facebook"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Instant delivery
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            100% Free
          </div>
        </div>
      </div>
    </div>
  );
}
