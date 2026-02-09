"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/components/ui/date-time-picker";
import { IconGripVertical } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/storage";
import type { TaskData } from "./types";

interface TodoItemProps {
  task: TaskData;
  selected?: boolean;
  onSelect?: (task: TaskData) => void;
  onToggleComplete?: (taskId: string) => void;
}

/**
 * Format a date as a relative verbose string
 */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Due yesterday";
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays > 7 && diffDays <= 14) return "In 2 weeks";
  if (diffDays > 14) return `In ${Math.ceil(diffDays / 7)} weeks`;
  if (diffDays < -1 && diffDays >= -7) return `Due ${Math.abs(diffDays)} days ago`;
  if (diffDays < -7 && diffDays >= -14) return "Due 2 weeks ago";
  if (diffDays < -14) return `Due ${Math.ceil(Math.abs(diffDays) / 7)} weeks ago`;

  return formatDateTime(date);
}

// Global state for date display mode (shared across all TodoItems)
let globalDateMode: "date" | "relative" = "date";
const listeners: Set<() => void> = new Set();

function useDateDisplayMode() {
  const [mode, setMode] = useState<"date" | "relative">(globalDateMode);

  useEffect(() => {
    // Initialize from localStorage on mount
    const stored = storage.get("todo:dateDisplayMode", "date");
    globalDateMode = stored;
    setMode(stored);

    // Subscribe to changes
    const listener = () => setMode(globalDateMode);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  const toggleMode = useCallback(() => {
    const newMode = globalDateMode === "date" ? "relative" : "date";
    globalDateMode = newMode;
    storage.set("todo:dateDisplayMode", newMode);
    listeners.forEach((l) => l());
  }, []);

  return { mode, toggleMode };
}

export function TodoItem({
  task,
  selected = false,
  onSelect,
  onToggleComplete,
}: TodoItemProps) {
  const { mode, toggleMode } = useDateDisplayMode();

  const handleDateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMode();
  };

  const displayDate = task.dueDate
    ? mode === "relative"
      ? formatRelativeDate(task.dueDate)
      : formatDateTime(task.dueDate)
    : null;

  // Determine if date is overdue for styling
  const isOverdue = task.dueDate && !task.completed && task.dueDate < new Date();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect?.(task);
      }}
      className={cn(
        "group hover:bg-accent/50 flex items-start gap-2 rounded-lg border p-3 transition-colors cursor-pointer",
        selected && "bg-accent border-primary/30",
        task.completed && "opacity-50",
      )}
    >
      {/* Drag handle */}
      <IconGripVertical className="text-muted-foreground/0 group-hover:text-muted-foreground/50 mt-0.5 h-4 w-4 shrink-0 transition-colors" />

      {/* Checkbox */}
      <Checkbox
        checked={task.completed}
        className={cn(
          "mt-0.5 shrink-0",
          !task.completed && task.priority === 3 && "border-red-500",
          !task.completed && task.priority === 2 && "border-orange-500",
          !task.completed && task.priority === 1 && "border-blue-500",
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete?.(task.id);
        }}
      />

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "truncate text-sm flex-1",
              task.completed && "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </span>

          {/* Due date - moved to right side */}
          {displayDate && !task.completed && (
            <button
              type="button"
              onClick={handleDateClick}
              className={cn(
                "shrink-0 text-xs px-1.5 py-0.5 rounded hover:bg-accent/50 transition-colors",
                isOverdue ? "text-destructive" : "text-primary"
              )}
            >
              {displayDate}
            </button>
          )}
        </div>

        {/* Meta row - tags only now */}
        {task.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {task.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-xs h-5 px-1.5 gap-1"
              >
                <span className="text-muted-foreground">#</span>
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
