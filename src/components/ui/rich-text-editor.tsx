"use client";

import { useRef, useCallback, useEffect } from "react";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

type ToolbarButton = {
  label: string;
  icon: React.ReactNode;
  command: string;
  arg?: string;
  type?: "block" | "inline";
};

const TOOLBAR_GROUPS: (ToolbarButton | "separator")[][] = [
  [
    {
      label: "Bold",
      icon: <span className="font-bold">B</span>,
      command: "bold",
    },
    {
      label: "Italic",
      icon: <span className="italic">I</span>,
      command: "italic",
    },
    {
      label: "Underline",
      icon: <span className="underline">U</span>,
      command: "underline",
    },
    {
      label: "Strikethrough",
      icon: <span className="line-through">S</span>,
      command: "strikeThrough",
    },
  ],
  [
    {
      label: "Heading 1",
      icon: (
        <span className="text-[11px] font-bold">
          H<sub>1</sub>
        </span>
      ),
      command: "formatBlock",
      arg: "h1",
      type: "block",
    },
    {
      label: "Heading 2",
      icon: (
        <span className="text-[11px] font-bold">
          H<sub>2</sub>
        </span>
      ),
      command: "formatBlock",
      arg: "h2",
      type: "block",
    },
    {
      label: "Heading 3",
      icon: (
        <span className="text-[11px] font-bold">
          H<sub>3</sub>
        </span>
      ),
      command: "formatBlock",
      arg: "h3",
      type: "block",
    },
    {
      label: "Paragraph",
      icon: <span className="text-[11px] font-medium">¶</span>,
      command: "formatBlock",
      arg: "p",
      type: "block",
    },
  ],
  [
    {
      label: "Bullet List",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      ),
      command: "insertUnorderedList",
    },
    {
      label: "Numbered List",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      command: "insertOrderedList",
    },
  ],
  [
    {
      label: "Link",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      command: "createLink",
    },
    {
      label: "Remove Link",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728A9 9 0 015.636 5.636" />
        </svg>
      ),
      command: "unlink",
    },
  ],
  [
    {
      label: "Clear Formatting",
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414-6.414a2 2 0 012.828 0L19.07 12.414a2 2 0 010 2.828L12.414 21.9a2 2 0 01-2.828 0L3 15.07a2 2 0 010-2.828z" />
        </svg>
      ),
      command: "removeFormat",
    },
  ],
];

function cleanHtml(html: string): string {
  // Remove any style attributes, class attributes, and data attributes
  // Keep only structural tags
  return html
    .replace(/\s*style="[^"]*"/gi, "")
    .replace(/\s*class="[^"]*"/gi, "")
    .replace(/\s*data-[a-z-]+="[^"]*"/gi, "")
    // Remove empty spans
    .replace(/<span>(.*?)<\/span>/gi, "$1")
    // Convert <b> and <strong> to just <b>
    .replace(/<strong>/gi, "<b>")
    .replace(/<\/strong>/gi, "</b>")
    // Convert <em> to <i>
    .replace(/<em>/gi, "<i>")
    .replace(/<\/em>/gi, "</i>")
    // Remove font tags
    .replace(/<font[^>]*>/gi, "")
    .replace(/<\/font>/gi, "")
    // Clean up consecutive <br>
    .replace(/(<br\s*\/?>\s*){3,}/gi, "<br><br>");
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync external value changes into the editor
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(cleanHtml(editorRef.current.innerHTML));
    }
  }, [onChange]);

  const execCommand = useCallback(
    (command: string, arg?: string) => {
      // Focus back on editor
      editorRef.current?.focus();

      if (command === "createLink") {
        const selection = window.getSelection();
        const selectedText = selection?.toString() || "";
        const url = prompt("Enter URL:", "https://");
        if (!url) return;
        if (!selectedText) {
          // No text selected, insert the URL as the link text too
          document.execCommand(
            "insertHTML",
            false,
            `<a href="${url}">${url}</a>`
          );
        } else {
          document.execCommand("createLink", false, url);
        }
      } else if (command === "formatBlock") {
        document.execCommand("formatBlock", false, `<${arg}>`);
      } else {
        document.execCommand(command, false, arg);
      }

      // Trigger change
      handleInput();
    },
    [handleInput]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      // Paste as plain text to avoid bringing in styled content
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
      handleInput();
    },
    [handleInput]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Handle keyboard shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            execCommand("bold");
            break;
          case "i":
            e.preventDefault();
            execCommand("italic");
            break;
          case "u":
            e.preventDefault();
            execCommand("underline");
            break;
          case "k":
            e.preventDefault();
            execCommand("createLink");
            break;
        }
      }
    },
    [execCommand]
  );

  return (
    <div className="border border-htd-card-border rounded-lg overflow-hidden focus-within:border-htd-purple transition-colors">
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 bg-[#0d1220] border-b border-htd-card-border">
        {TOOLBAR_GROUPS.map((group, gi) => (
          <div key={gi} className="flex items-center">
            {gi > 0 && (
              <div className="w-px h-5 bg-htd-card-border mx-1.5" />
            )}
            {group.map((btn) => {
              if (btn === "separator") return null;
              const b = btn as ToolbarButton;
              return (
                <button
                  key={b.label}
                  type="button"
                  title={b.label}
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent losing focus from editor
                    execCommand(b.command, b.arg);
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover:text-white hover:bg-white/10 transition-colors text-xs"
                >
                  {b.icon}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          data-placeholder={placeholder}
          className="min-h-[400px] max-h-[600px] overflow-y-auto px-4 py-3 bg-[#0a0e1a] text-white text-sm leading-relaxed outline-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground [&:empty]:before:pointer-events-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:my-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:my-1 [&_a]:text-htd-purple-light [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-1 [&_li]:my-0.5 [&_p]:my-0"
        />
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 bg-[#0d1220] border-t border-htd-card-border">
        <p className="text-[10px] text-muted-foreground">
          <kbd className="px-1 py-0.5 rounded bg-white/5 text-[10px]">⌘B</kbd>{" "}
          Bold{" "}
          <kbd className="px-1 py-0.5 rounded bg-white/5 text-[10px] ml-2">
            ⌘I
          </kbd>{" "}
          Italic{" "}
          <kbd className="px-1 py-0.5 rounded bg-white/5 text-[10px] ml-2">
            ⌘U
          </kbd>{" "}
          Underline{" "}
          <kbd className="px-1 py-0.5 rounded bg-white/5 text-[10px] ml-2">
            ⌘K
          </kbd>{" "}
          Link
        </p>
      </div>
    </div>
  );
}
