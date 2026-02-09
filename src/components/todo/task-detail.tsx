"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconFlag,
  IconCalendar,
  IconTag,
  IconTrash,
  IconX,
  IconPlus,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { type TaskData, type Priority, PRIORITY_CONFIG, type TagData } from "./types";
import { MarkdownEditor } from "./markdown-editor";

// Priority border classes for the checkbox (Tailwind can't interpolate dynamic classes)
const PRIORITY_BORDER_CLASSES: Record<Priority, string> = {
  0: "",
  1: "border-blue-500",
  2: "border-orange-500",
  3: "border-red-500",
};

interface TaskDetailProps {
  task: TaskData;
  availableTags?: TagData[];
  onUpdateTask: (taskId: string, updates: Partial<TaskData>) => void;
  onDeleteTask: (taskId: string) => void;
  onClose: () => void;
  onCreateTag?: (name: string) => void;
}

export function TaskDetail({
  task,
  availableTags = [],
  onUpdateTask,
  onDeleteTask,
  onClose,
  onCreateTag,
}: TaskDetailProps) {
  const [tagInput, setTagInput] = useState("");
  const [showTagPopover, setShowTagPopover] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  // Filter available tags to exclude already assigned ones
  const unassignedTags = useMemo(() => {
    const assignedIds = new Set(task.tags.map((t) => t.id));
    return availableTags.filter((t) => !assignedIds.has(t.id));
  }, [availableTags, task.tags]);

  // Filter tags by input
  const filteredTags = useMemo(() => {
    if (!tagInput.trim()) return unassignedTags;
    return unassignedTags.filter((t) =>
      t.name.toLowerCase().includes(tagInput.toLowerCase())
    );
  }, [unassignedTags, tagInput]);

  const handleAddExistingTag = useCallback(
    (tagToAdd: TagData) => {
      // Need to merge with task.tags which has the full tag shape from API
      const newTagForTask = { id: tagToAdd.id, name: tagToAdd.name, color: tagToAdd.color, userId: "" };
      const newTags = [...task.tags, newTagForTask] as typeof task.tags;
      onUpdateTask(task.id, { tags: newTags });
      setTagInput("");
      setShowTagPopover(false);
    },
    [task, onUpdateTask]
  );

  const handleCreateTag = useCallback(() => {
    if (tagInput.trim() && onCreateTag) {
      onCreateTag(tagInput.trim());
      setTagInput("");
      setShowTagPopover(false);
    }
  }, [tagInput, onCreateTag]);

  const handleRemoveTag = useCallback(
    (tagId: string) => {
      const newTags = task.tags.filter((t) => t.id !== tagId);
      onUpdateTask(task.id, { tags: newTags });
    },
    [task.id, task.tags, onUpdateTask]
  );

  const priorityBorderClass = !task.completed
    ? PRIORITY_BORDER_CLASSES[task.priority as Priority]
    : "";

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={task.completed}
            onCheckedChange={(checked) =>
              onUpdateTask(task.id, { completed: !!checked })
            }
            className={cn(priorityBorderClass)}
          />
          <span className="text-muted-foreground text-xs">
            {task.completed ? "Completed" : "In Progress"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDeleteTask(task.id)}
          >
            <IconTrash className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
          >
            <IconX className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-4 p-4">
        {/* Title */}
        <input
          type="text"
          value={task.title}
          onChange={(e) => onUpdateTask(task.id, { title: e.target.value })}
          className={cn(
            "w-full bg-transparent text-lg font-semibold outline-none",
            "placeholder:text-muted-foreground/50",
            task.completed && "line-through text-muted-foreground",
          )}
          placeholder="Task title..."
        />

        <Separator />

        {/* Properties Grid */}
        <div className="space-y-3">
          {/* Priority */}
          <div className="flex items-center gap-3">
            <div className="flex w-28 items-center gap-2 text-muted-foreground">
              <IconFlag className="h-4 w-4" />
              <span className="text-xs">Priority</span>
            </div>
            <Select
              value={String(task.priority)}
              onValueChange={(v) =>
                onUpdateTask(task.id, {
                  priority: parseInt(v) as Priority,
                })
              }
            >
              <SelectTrigger className="h-8 flex-1" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRIORITY_CONFIG).map(
                  ([value, config]) => (
                    <SelectItem key={value} value={value}>
                      <span className={cn("flex items-center gap-2", config.color)}>
                        {value !== "0" && <IconFlag className="h-3 w-3" />}
                        {config.label}
                      </span>
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div className="flex items-center gap-3">
            <div className="flex w-28 items-center gap-2 text-muted-foreground">
              <IconCalendar className="h-4 w-4" />
              <span className="text-xs">Due Date</span>
            </div>
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 flex-1 justify-start text-left font-normal",
                    !task.dueDate && "text-muted-foreground"
                  )}
                >
                  {task.dueDate
                    ? format(task.dueDate, "MMM d, yyyy")
                    : "No due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={task.dueDate ?? undefined}
                  onSelect={(date) => {
                    onUpdateTask(task.id, { dueDate: date ?? null });
                    setDateOpen(false);
                  }}
                  initialFocus
                />
                {task.dueDate && (
                  <div className="border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground"
                      onClick={() => {
                        onUpdateTask(task.id, { dueDate: null });
                        setDateOpen(false);
                      }}
                    >
                      <IconX className="mr-2 h-3 w-3" />
                      Clear date
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Tags */}
          <div className="flex items-start gap-3">
            <div className="flex w-28 items-center gap-2 pt-1 text-muted-foreground">
              <IconTag className="h-4 w-4" />
              <span className="text-xs">Tags</span>
            </div>
            <div className="flex flex-1 flex-wrap items-center gap-1.5">
              {task.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="gap-1 text-xs pr-1"
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag.id)}
                    className="hover:bg-muted rounded-full p-0.5 ml-0.5"
                  >
                    <IconX className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}

              <Popover open={showTagPopover} onOpenChange={setShowTagPopover}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 px-1.5 text-xs text-muted-foreground"
                  >
                    <IconPlus className="h-3 w-3" />
                    Add
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="start">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        setShowTagPopover(false);
                        setTagInput("");
                      }
                      if (e.key === "Enter" && tagInput.trim()) {
                        // If there's an exact match, add it; otherwise create new
                        const exactMatch = filteredTags.find(
                          (t) => t.name.toLowerCase() === tagInput.toLowerCase()
                        );
                        if (exactMatch) {
                          handleAddExistingTag(exactMatch);
                        } else if (onCreateTag) {
                          handleCreateTag();
                        }
                      }
                    }}
                    placeholder="Search or create tag..."
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                    {filteredTags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-accent"
                        onClick={() => handleAddExistingTag(tag)}
                      >
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </button>
                    ))}
                    {tagInput.trim() &&
                      !filteredTags.some(
                        (t) => t.name.toLowerCase() === tagInput.toLowerCase()
                      ) &&
                      onCreateTag && (
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-primary hover:bg-accent"
                          onClick={handleCreateTag}
                        >
                          <IconPlus className="h-4 w-4" />
                          Create &ldquo;{tagInput.trim()}&rdquo;
                        </button>
                      )}
                    {filteredTags.length === 0 && !tagInput.trim() && (
                      <p className="text-muted-foreground text-sm px-2 py-1.5">
                        No tags available
                      </p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <Separator />

        {/* Body / Description - Markdown Editor */}
        <div className="flex flex-1 flex-col">
          <h4 className="mb-2 text-xs font-medium text-muted-foreground uppercase">
            Description
          </h4>
          <MarkdownEditor
            value={task.body ?? ""}
            onChange={(body) => onUpdateTask(task.id, { body })}
            placeholder="Add a more detailed description..."
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-2">
        <p className="text-muted-foreground text-xs">
          Created{" "}
          {task.createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
