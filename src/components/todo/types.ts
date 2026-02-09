import type { RouterOutputs } from "@/trpc/react";
import { IconCalendar, IconCalendarWeek, IconInbox, IconListCheck } from "@tabler/icons-react";

// ============================================================================
// Core Task Types
// ============================================================================

export type TaskData = RouterOutputs["todo"]["getTasks"][number];
export type Priority = 0 | 1 | 2 | 3;

/** @deprecated Use `Priority` instead */
export type AvailablePriorities = Priority;

export interface SmartList {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
}

// ============================================================================
// Task Input Types
// ============================================================================

export interface ParsedTaskInput {
  title: string;
  priority: Priority;
  /** Array of tag IDs selected by the user */
  tagIds: string[];
  dueDate: Date | null;
}

/** Default values to pre-populate in the task input based on active group */
export interface TaskInputDefaults {
  dueDate?: Date | null;
  tagIds?: string[];
  priority?: Priority;
}

/** Tag data for local state (before or after API sync) */
export interface TagData {
  id: string;
  name: string;
  color: string;
}

/** Autocomplete mode for the task input */
export type AutocompleteMode = "none" | "priority" | "tag";

/** Autocomplete dropdown option */
export interface AutocompleteOption {
  id: string;
  label: string;
  color?: string;
  icon?: React.ReactNode;
  isCreateNew?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

export const SMART_LISTS = [
  { id: "all", name: "All", icon: IconListCheck },
  { id: "today", name: "Today", icon: IconCalendar },
  { id: "week", name: "Next 7 Days", icon: IconCalendarWeek },
  { id: "inbox", name: "Inbox", icon: IconInbox },
];

export const PRIORITY_CONFIG = {
  0: { id: "0", label: "None", color: "text-muted-foreground", bg: "" },
  1: { id: "1", label: "Low", color: "text-blue-500", bg: "bg-blue-500/10" },
  2: { id: "2", label: "Medium", color: "text-orange-500", bg: "bg-orange-500/10" },
  3: { id: "3", label: "High", color: "text-red-500", bg: "bg-red-500/10" },
} as const;

/** Available colors for new tags */
export const TAG_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e",
] as const;

/** Generate a random color for new tags */
export function generateRandomTagColor(): string {
  return TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)]!;
}

// ============================================================================
// Subtask Utilities
// ============================================================================

/** Stats for a task's children (used for progress pie chart) */
export interface SubtaskStats {
  total: number;
  completed: number;
}

/** Check if a task has children (is a parent task) */
export function hasChildren(task: TaskData): boolean {
  return (task.children?.length ?? 0) > 0;
}

/**
 * Recursively count all descendants and how many are completed.
 * Used for the progress pie chart on parent tasks.
 */
export function getSubtaskStats(task: TaskData): SubtaskStats {
  let total = 0;
  let completed = 0;

  function countChildren(children: TaskData["children"]) {
    if (!children) return;
    for (const child of children) {
      total++;
      if (child.completed) completed++;
      countChildren(child.children);
    }
  }

  countChildren(task.children);
  return { total, completed };
}