"use client";

import React, { useState, useRef, useCallback } from "react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconList,
  IconListNumbers,
  IconCheckbox,
  IconCode,
  IconH1,
  IconH2,
  IconQuote,
  IconLink,
  IconEye,
  IconEdit,
} from "@tabler/icons-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Add description...",
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wrapSelection = useCallback(
    (before: string, after: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const newText =
        value.substring(0, start) +
        before +
        (selectedText || "text") +
        after +
        value.substring(end);

      onChange(newText);

      // Restore cursor position
      requestAnimationFrame(() => {
        textarea.focus();
        const newStart = start + before.length;
        const newEnd = selectedText
          ? newStart + selectedText.length
          : newStart + 4;
        textarea.setSelectionRange(newStart, newEnd);
      });
    },
    [value, onChange],
  );

  const insertAtLine = useCallback(
    (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const newText =
        value.substring(0, lineStart) + prefix + value.substring(lineStart);

      onChange(newText);

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length,
        );
      });
    },
    [value, onChange],
  );

  const renderPreview = (md: string) => {
    // Simple markdown to HTML conversion for preview
    const html = md
      .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-3 mb-1">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-3 mb-1">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/~~(.+?)~~/g, "<del>$1</del>")
      .replace(/`(.+?)`/g, '<code class="bg-muted rounded px-1 py-0.5 text-xs">$1</code>')
      .replace(/^- \[x\] (.+)$/gm, '<div class="flex items-center gap-2"><input type="checkbox" checked disabled class="rounded" /><span class="line-through text-muted-foreground">$1</span></div>')
      .replace(/^- \[ \] (.+)$/gm, '<div class="flex items-center gap-2"><input type="checkbox" disabled class="rounded" /><span>$1</span></div>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-muted-foreground/30 pl-3 italic text-muted-foreground">$1</blockquote>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline">$1</a>')
      .replace(/\n/g, "<br />");
    return html;
  };

  const toolbarItems = [
    {
      icon: IconBold,
      action: () => wrapSelection("**", "**"),
      tooltip: "Bold",
    },
    {
      icon: IconItalic,
      action: () => wrapSelection("*", "*"),
      tooltip: "Italic",
    },
    {
      icon: IconStrikethrough,
      action: () => wrapSelection("~~", "~~"),
      tooltip: "Strikethrough",
    },
    { type: "separator" as const },
    { icon: IconH1, action: () => insertAtLine("# "), tooltip: "Heading 1" },
    { icon: IconH2, action: () => insertAtLine("## "), tooltip: "Heading 2" },
    { type: "separator" as const },
    {
      icon: IconList,
      action: () => insertAtLine("- "),
      tooltip: "Bullet list",
    },
    {
      icon: IconListNumbers,
      action: () => insertAtLine("1. "),
      tooltip: "Numbered list",
    },
    {
      icon: IconCheckbox,
      action: () => insertAtLine("- [ ] "),
      tooltip: "Checklist",
    },
    { type: "separator" as const },
    {
      icon: IconCode,
      action: () => wrapSelection("`", "`"),
      tooltip: "Code",
    },
    {
      icon: IconQuote,
      action: () => insertAtLine("> "),
      tooltip: "Quote",
    },
    {
      icon: IconLink,
      action: () => wrapSelection("[", "](url)"),
      tooltip: "Link",
    },
  ];

  return (
    <div className="flex flex-1 flex-col rounded-lg border">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b px-2 py-1">
        {toolbarItems.map((item, idx) => {
          if ("type" in item && item.type === "separator") {
            return (
              <Separator
                key={`sep-${idx}`}
                orientation="vertical"
                className="mx-1 h-5"
              />
            );
          }
          if ("icon" in item) {
            const Icon = item.icon;
            return (
              <Toggle
                key={item.tooltip}
                size="sm"
                variant="outline"
                className="h-7 w-7 p-0 data-[state=on]:bg-transparent"
                pressed={false}
                onPressedChange={() => item.action()}
                aria-label={item.tooltip}
              >
                <Icon className="h-3.5 w-3.5" />
              </Toggle>
            );
          }
          return null;
        })}

        <div className="flex-1" />

        {/* Preview toggle */}
        <Toggle
          size="sm"
          variant="outline"
          className="h-7 w-7 p-0"
          pressed={isPreview}
          onPressedChange={setIsPreview}
          aria-label="Toggle preview"
        >
          {isPreview ? (
            <IconEdit className="h-3.5 w-3.5" />
          ) : (
            <IconEye className="h-3.5 w-3.5" />
          )}
        </Toggle>
      </div>

      {/* Editor / Preview */}
      {isPreview ? (
        <div
          className="prose prose-sm dark:prose-invert flex-1 overflow-y-auto p-3 text-sm"
          dangerouslySetInnerHTML={{
            __html: renderPreview(value) || `<span class="text-muted-foreground">${placeholder}</span>`,
          }}
        />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "flex-1 resize-none bg-transparent p-3 text-sm outline-none",
            "placeholder:text-muted-foreground/50",
            "min-h-[200px]",
          )}
        />
      )}
    </div>
  );
}
