"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TodoListButtonProps {
  icon: React.ReactNode;
  text: string;
  count?: number;
  dotColor?: string;
  selected?: boolean;
  onClick?: () => void;
}

export function TodoListButton({
  icon,
  text,
  count,
  dotColor,
  selected = false,
  onClick,
}: TodoListButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-selected={selected}
      className={cn(
        "group hover:bg-accent relative flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left transition-colors",
        selected && "bg-accent",
      )}
    >
      {/* Icon */}
      <div className="flex h-4 w-4 shrink-0 items-center justify-center">
        {icon}
      </div>

      {/* Text Label */}
      <span className="min-w-0 flex-1 truncate text-sm">{text}</span>

      {/* Colored Dot */}
      {dotColor && (
        <div
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: dotColor }}
        />
      )}

      {/* Count */}
      {count !== undefined && (
        <span className="text-muted-foreground shrink-0 text-xs">
          {count}
        </span>
      )}
    </button>
  );
}
