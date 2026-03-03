"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export function HiddenGate() {
  const keysRef = useRef<string[]>([]);
  const keyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [pressing, setPressing] = useState(false);

  const unlock = useCallback(() => {
    // Set gate cookie (5 minutes) then redirect to admin login
    document.cookie = "htd-admin-gate=1; path=/; max-age=300; SameSite=Lax";
    window.location.href = "/admin/login";
  }, []);

  // Key sequence: h → t → d (typed within 2s)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (!["h", "t", "d"].includes(key)) {
        keysRef.current = [];
        return;
      }

      keysRef.current = [...keysRef.current, key];

      // Reset after 2 seconds of inactivity
      if (keyTimeoutRef.current) clearTimeout(keyTimeoutRef.current);
      keyTimeoutRef.current = setTimeout(() => {
        keysRef.current = [];
      }, 2000);

      const sequence = keysRef.current.join("");

      if (sequence === "htd") {
        keysRef.current = [];
        unlock();
        return;
      }

      // If it doesn't match the prefix of "htd", reset
      if (!"htd".startsWith(sequence)) {
        keysRef.current = [];
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (keyTimeoutRef.current) clearTimeout(keyTimeoutRef.current);
    };
  }, [unlock]);

  // Long press handlers (5 seconds)
  function handlePressStart() {
    setPressing(true);
    pressTimerRef.current = setTimeout(() => {
      unlock();
    }, 5000);
  }

  function handlePressEnd() {
    setPressing(false);
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  }

  useEffect(() => {
    return () => {
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-htd-purple/8 rounded-full blur-[100px]" />
      </div>

      <div className="text-center relative z-10">
        <div
          className={`w-20 h-20 mx-auto rounded-2xl bg-htd-purple/10 flex items-center justify-center mb-6 select-none cursor-default transition-all duration-300 ${
            pressing ? "scale-95 bg-htd-purple/20" : ""
          }`}
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          onTouchCancel={handlePressEnd}
          onContextMenu={(e) => e.preventDefault()}
        >
          <svg
            className="w-10 h-10 text-htd-purple-light pointer-events-none"
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
      </div>
    </div>
  );
}
