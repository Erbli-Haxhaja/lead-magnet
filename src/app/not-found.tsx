import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-htd-purple/8 rounded-full blur-[100px]" />
      </div>

      <div className="text-center relative z-10">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-htd-purple/10 flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-htd-purple-light"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-white mb-3">
          Document Not Found
        </h1>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          This document may have been removed or the link might be incorrect.
          Please check the URL and try again.
        </p>

        <Link href="/">
          <Button className="bg-htd-purple hover:bg-htd-purple-dark text-white">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
