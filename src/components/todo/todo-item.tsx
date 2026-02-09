"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  IconFlag,
  IconGripVertical,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { PRIORITY_CONFIG } from "./types";
import type { TaskData } from "./types";

interface TodoItemProps {
  task: TaskData;
  selected?: boolean;
  onSelect?: (task: TaskData) => void;
  onToggleComplete?: (taskId: string) => void;
}

export function TodoItem({
  task,
  selected = false,
  onSelect,
  onToggleComplete,
}: TodoItemProps) {
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
              "truncate text-sm",
              task.completed && "line-through text-muted-foreground",
            )}
          >
            {task.title}
          </span>

          {/* Priority flag */}
          {task.priority > 0 && !task.completed && (
            <IconFlag
              className={cn(
                "h-3.5 w-3.5 shrink-0",
                PRIORITY_CONFIG[task.priority as 1 | 2 | 3].color,
              )}
            />
          )}
        </div>

        {/* Meta row */}
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {/* Tags */}
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

          {/* Due date */}
          {task.dueDate && !task.completed && (
            <span
              className={cn(
                "text-xs text-primary",
              )}
            >
              {task.dueDate.toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
