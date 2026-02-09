"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateTimePicker, formatDateTime } from "@/components/ui/date-time-picker";
import { IconPlus, IconFlag, IconCalendar, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { type ParsedTaskInput, type TaskInputDefaults, PRIORITY_CONFIG } from "./types";
import { useTaskInput } from "./use-task-input";
import { useAutocompleteOptions } from "./use-autocomplete-options";

interface TaskInputProps {
  onAddTask: (parsed: ParsedTaskInput) => void;
  defaults?: TaskInputDefaults;
}

interface DatePickerButtonProps {
  dueDate: Date | null;
  setDueDate: (date: Date | null) => void;
}

function DatePickerButton({ dueDate, setDueDate }: DatePickerButtonProps) {
  return (
    <DateTimePicker
      value={dueDate}
      onChange={setDueDate}
      trigger={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 shrink-0",
            dueDate ? "text-primary" : "text-muted-foreground"
          )}
        >
          <IconCalendar className="h-4 w-4" />
        </Button>
      }
    />
  );
}

// ============================================================================
// Autocomplete Dropdown
// ============================================================================

interface AutocompleteDropdownProps {
  mode: "priority" | "tag";
  options: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    isCreateNew?: boolean;
  }>;
  selectedIndex: number;
  onSelect: (optionId: string, isCreate: boolean) => void;
  onHover: (index: number) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

function AutocompleteDropdown({
  mode,
  options,
  selectedIndex,
  onSelect,
  onHover,
  dropdownRef,
}: AutocompleteDropdownProps) {
  if (options.length === 0) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border bg-popover p-1 shadow-lg"
    >
      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
        {mode === "priority" ? "Select Priority" : "Select Tag"}
      </div>

      {options.map((option, index) => {
        const isInfoOnly = option.id === "create:new";
        const isCreate = option.id.startsWith("create:") && !isInfoOnly;

        return (
          <button
            key={option.id}
            type="button"
            disabled={isInfoOnly}
            className={cn(
              "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
              isInfoOnly
                ? "cursor-default text-muted-foreground"
                : index === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50",
              option.isCreateNew && "font-medium text-primary"
            )}
            onMouseDown={(e) => {
              e.preventDefault();
              if (!isInfoOnly) {
                onSelect(option.id, isCreate);
              }
            }}
            onMouseEnter={() => {
              if (!isInfoOnly) {
                onHover(index);
              }
            }}
          >
            {option.icon}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Modifier Badges
// ============================================================================

interface ModifierBadgesProps {
  priority: 0 | 1 | 2 | 3;
  onClearPriority: () => void;
  selectedTags: string[];
  getTagName: (id: string) => string;
  getTagColor: (id: string) => string;
  onRemoveTag: (id: string) => void;
  dueDate: Date | null;
  onClearDueDate: () => void;
}

function ModifierBadges({
  priority,
  onClearPriority,
  selectedTags,
  getTagName,
  getTagColor,
  onRemoveTag,
  dueDate,
  onClearDueDate,
}: ModifierBadgesProps) {
  const hasModifiers = priority > 0 || selectedTags.length > 0 || dueDate !== null;

  if (!hasModifiers) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t px-3 py-2">
      {/* Priority Badge */}
      {priority > 0 && (
        <Badge
          variant="secondary"
          className={cn(
            "cursor-pointer gap-1 text-xs",
            PRIORITY_CONFIG[priority].bg
          )}
          onClick={onClearPriority}
        >
          <IconFlag className={cn("h-3 w-3", PRIORITY_CONFIG[priority].color)} />
          {PRIORITY_CONFIG[priority].label}
          <IconX className="ml-0.5 h-3 w-3 opacity-60 hover:opacity-100" />
        </Badge>
      )}

      {/* Tag Badges */}
      {selectedTags.map((tagId) => (
        <Badge
          key={tagId}
          variant="outline"
          className="cursor-pointer gap-1 text-xs"
          onClick={() => onRemoveTag(tagId)}
        >
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: getTagColor(tagId) }}
          />
          {getTagName(tagId)}
          <IconX className="ml-0.5 h-3 w-3 opacity-60 hover:opacity-100" />
        </Badge>
      ))}

      {/* Due Date Badge */}
      {dueDate && (
        <Badge
          variant="secondary"
          className="cursor-pointer gap-1 text-xs"
          onClick={onClearDueDate}
        >
          <IconCalendar className="h-3 w-3" />
          {formatDateTime(dueDate)}
          <IconX className="ml-0.5 h-3 w-3 opacity-60 hover:opacity-100" />
        </Badge>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function TaskInput({ onAddTask, defaults }: TaskInputProps) {
  const {
    // Form state
    value,
    setValue,
    priority,
    setPriority,
    selectedTags,
    dueDate,
    setDueDate,
    // Focus state
    isFocused,
    setIsFocused,
    // Autocomplete state
    autocompleteMode,
    autocompleteIndex,
    setAutocompleteIndex,
    searchText,
    // Refs
    inputRef,
    dropdownRef,
    // Tag helpers
    getTagName,
    getTagColor,
    removeTag,
    // Actions
    selectAutocompleteOption,
    closeAutocomplete,
    handleSubmit,
    resetForm,
  } = useTaskInput(onAddTask, defaults);

  const autocompleteOptions = useAutocompleteOptions({
    mode: autocompleteMode,
    selectedTags,
    searchText,
  });

  // ---------------------------------------------------------------------------
  // Keyboard Handler
  // ---------------------------------------------------------------------------
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle autocomplete navigation
    if (autocompleteMode !== "none" && autocompleteOptions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setAutocompleteIndex(
          (autocompleteIndex + 1) % autocompleteOptions.length
        );
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setAutocompleteIndex(
          (autocompleteIndex - 1 + autocompleteOptions.length) %
          autocompleteOptions.length
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const selectedOption = autocompleteOptions[autocompleteIndex];
        // Don't select informational-only options
        if (selectedOption && selectedOption.id !== "create:new") {
          const isCreate =
            selectedOption.id.startsWith("create:") &&
            selectedOption.id !== "create:new";
          selectAutocompleteOption(selectedOption.id, isCreate);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        closeAutocomplete();
        return;
      }
    }

    // Normal input handling
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      resetForm();
      inputRef.current?.blur();
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div
      className={cn(
        "relative rounded-lg border transition-all",
        isFocused
          ? "border-primary/50 ring-2 ring-primary/20"
          : "border-border hover:border-primary/30"
      )}
    >
      {/* Input Row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <DatePickerButton dueDate={dueDate} setDueDate={setDueDate} />

        <IconPlus
          className={cn(
            "h-4 w-4 shrink-0 transition-colors",
            isFocused ? "text-primary" : "text-muted-foreground"
          )}
        />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            // Delay closing autocomplete to allow click events
            setTimeout(closeAutocomplete, 150);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Add a task... type ! for priority, # for tag"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />

        {value.trim() && (
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onMouseDown={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            Add
          </Button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {autocompleteMode !== "none" && (
        <AutocompleteDropdown
          mode={autocompleteMode}
          options={autocompleteOptions}
          selectedIndex={autocompleteIndex}
          onSelect={selectAutocompleteOption}
          onHover={setAutocompleteIndex}
          dropdownRef={dropdownRef}
        />
      )}

      {/* Selected Modifiers Preview */}
      <ModifierBadges
        priority={priority}
        onClearPriority={() => setPriority(0)}
        selectedTags={selectedTags}
        getTagName={getTagName}
        getTagColor={getTagColor}
        onRemoveTag={removeTag}
        dueDate={dueDate}
        onClearDueDate={() => setDueDate(null)}
      />
    </div>
  );
}
