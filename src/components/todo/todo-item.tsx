"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/components/ui/date-time-picker";
import { IconGripVertical, IconChevronDown, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { storage } from "@/lib/storage";
import { type TaskData, hasChildren, getSubtaskStats } from "./types";
import { ProgressPie } from "./progress-pie";

interface TodoItemProps {
  task: TaskData;
  selected?: boolean;
  onSelect?: (task: TaskData) => void;
  onToggleComplete?: (taskId: string) => void;
  /** Nesting depth for indentation (0 = root) */
  depth?: number;
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
  depth = 0,
}: TodoItemProps) {
  const { mode, toggleMode } = useDateDisplayMode();
  const [expanded, setExpanded] = useState(true);

  const isParent = hasChildren(task);
  const stats = useMemo(() => (isParent ? getSubtaskStats(task) : null), [task, isParent]);

  // Parent tasks are auto-completed when all children are done
  const isAutoCompleted = isParent && stats && stats.total > 0 && stats.completed === stats.total;

  const handleDateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMode();
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  const displayDate = task.dueDate
    ? mode === "relative"
      ? formatRelativeDate(task.dueDate)
      : formatDateTime(task.dueDate)
    : null;

  // Determine if date is overdue for styling
  const isOverdue = task.dueDate && !task.completed && !isAutoCompleted && task.dueDate < new Date();

  // Calculate left padding for nesting
  const nestPadding = depth * 24;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect?.(task)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelect?.(task);
        }}
        style={{ paddingLeft: `${12 + nestPadding}px` }}
        className={cn(
          "group hover:bg-accent/50 flex items-start gap-2 rounded-lg border p-3 transition-colors cursor-pointer",
          selected && "bg-accent border-primary/30",
          (task.completed || isAutoCompleted) && "opacity-50",
        )}
      >
        {/* Expand/collapse toggle for parent tasks */}
        {isParent ? (
          <button
            type="button"
            onClick={handleExpandClick}
            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground hover:text-foreground"
          >
            {expanded ? (
              <IconChevronDown className="h-4 w-4" />
            ) : (
              <IconChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <IconGripVertical className="text-muted-foreground/0 group-hover:text-muted-foreground/50 mt-0.5 h-4 w-4 shrink-0 transition-colors" />
        )}

        {/* Progress pie for parents, Checkbox for leaf tasks */}
        {isParent && stats ? (
          <ProgressPie completed={stats.completed} total={stats.total} />
        ) : (
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
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "truncate text-sm flex-1",
                (task.completed || isAutoCompleted) && "line-through text-muted-foreground",
              )}
            >
              {task.title}
            </span>

            {/* Subtask count badge for parents */}
            {isParent && stats && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {stats.completed}/{stats.total}
              </span>
            )}

            {/* Due date - moved to right side */}
            {displayDate && !task.completed && !isAutoCompleted && (
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

      {/* Render children recursively if expanded */}
      {isParent && expanded && (
        <div className="space-y-1.5">
          {task.children?.map((child) => (
            <TodoItem
              key={child.id}
              task={child}
              selected={selected && child.id === task.id}
              onSelect={onSelect}
              onToggleComplete={onToggleComplete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </>
  );
}
