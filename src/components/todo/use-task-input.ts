"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { api } from "@/trpc/react";
import {
    type Priority,
    type AutocompleteMode,
    type ParsedTaskInput,
    type TaskInputDefaults,
    type TagData,
    generateRandomTagColor,
} from "./types";

// ============================================================================
// Hook Return Type
// ============================================================================

export interface UseTaskInputReturn {
    // Form state
    value: string;
    setValue: (value: string) => void;
    priority: Priority;
    setPriority: (priority: Priority) => void;
    selectedTags: string[];
    dueDate: Date | null;
    setDueDate: (date: Date | null) => void;

    // Focus state
    isFocused: boolean;
    setIsFocused: (focused: boolean) => void;

    // Autocomplete state
    autocompleteMode: AutocompleteMode;
    autocompleteIndex: number;
    setAutocompleteIndex: (index: number) => void;
    triggerPosition: number | null;
    searchText: string;

    // Refs
    inputRef: React.RefObject<HTMLInputElement | null>;
    dropdownRef: React.RefObject<HTMLDivElement | null>;

    // Tag helpers
    getTagName: (tagId: string) => string;
    getTagColor: (tagId: string) => string;
    removeTag: (tagId: string) => void;

    // Actions
    selectAutocompleteOption: (optionId: string, isCreate: boolean) => void;
    closeAutocomplete: () => void;
    handleSubmit: () => void;
    resetForm: () => void;

    // Computed
    hasModifiers: boolean;

    // Loading states
    isCreatingTag: boolean;
}

// ============================================================================
// Hook Implementation
// ============================================================================

export function useTaskInput(
    onAddTask: (parsed: ParsedTaskInput) => void,
    defaults?: TaskInputDefaults
): UseTaskInputReturn {
    // ---------------------------------------------------------------------------
    // Form State
    // ---------------------------------------------------------------------------
    const [value, setValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [priority, setPriority] = useState<Priority>(defaults?.priority ?? 0);
    const [selectedTags, setSelectedTags] = useState<string[]>(defaults?.tagIds ?? []);
    const [dueDate, setDueDate] = useState<Date | null>(defaults?.dueDate ?? null);

    // ---------------------------------------------------------------------------
    // Autocomplete State
    // ---------------------------------------------------------------------------
    const [autocompleteMode, setAutocompleteMode] = useState<AutocompleteMode>("none");
    const [autocompleteIndex, setAutocompleteIndex] = useState(0);
    const [triggerPosition, setTriggerPosition] = useState<number | null>(null);

    // Track newly created tags (id -> tag data)
    const [newlyCreatedTags, setNewlyCreatedTags] = useState<Map<string, TagData>>(
        new Map()
    );

    // ---------------------------------------------------------------------------
    // Refs
    // ---------------------------------------------------------------------------
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ---------------------------------------------------------------------------
    // API
    // ---------------------------------------------------------------------------
    const tagsQuery = api.todo.getTags.useQuery();
    const utils = api.useUtils();

    const createTagMutation = api.todo.createTag.useMutation({
        onSuccess: (newTag) => {
            setSelectedTags((prev) => [...prev, newTag.id]);
            setNewlyCreatedTags((prev) =>
                new Map(prev).set(newTag.id, {
                    id: newTag.id,
                    name: newTag.name,
                    color: newTag.color,
                })
            );
            void utils.todo.getTags.invalidate();
        },
    });

    // ---------------------------------------------------------------------------
    // Computed Values
    // ---------------------------------------------------------------------------
    const hasModifiers = priority > 0 || selectedTags.length > 0 || dueDate !== null;

    const getSearchText = useCallback(() => {
        if (triggerPosition === null) return "";
        return value.slice(triggerPosition + 1).split(/\s/)[0] ?? "";
    }, [triggerPosition, value]);

    const searchText = getSearchText();

    // ---------------------------------------------------------------------------
    // Autocomplete Detection Effect
    // ---------------------------------------------------------------------------
    useEffect(() => {
        const cursorPos = inputRef.current?.selectionStart ?? value.length;

        // Find the last trigger character before cursor
        let lastBang = -1;
        let lastHash = -1;

        for (let i = cursorPos - 1; i >= 0; i--) {
            if (value[i] === " " || value[i] === "\n") break;
            if (value[i] === "!" && lastBang === -1) lastBang = i;
            if (value[i] === "#" && lastHash === -1) lastHash = i;
        }

        if (lastBang > lastHash && lastBang !== -1) {
            setAutocompleteMode("priority");
            setTriggerPosition(lastBang);
            setAutocompleteIndex(0);
        } else if (lastHash > lastBang && lastHash !== -1) {
            setAutocompleteMode("tag");
            setTriggerPosition(lastHash);
            setAutocompleteIndex(0);
        } else {
            setAutocompleteMode("none");
            setTriggerPosition(null);
        }
    }, [value]);

    // ---------------------------------------------------------------------------
    // Sync Form State with Defaults
    // ---------------------------------------------------------------------------
    useEffect(() => {
        setDueDate(defaults?.dueDate ?? null);
        setSelectedTags(defaults?.tagIds ?? []);
        setPriority(defaults?.priority ?? 0);
    }, [defaults?.dueDate, defaults?.tagIds, defaults?.priority]);

    // ---------------------------------------------------------------------------
    // Tag Helpers
    // ---------------------------------------------------------------------------
    const getTagName = useCallback(
        (tagId: string): string => {
            const newTag = newlyCreatedTags.get(tagId);
            if (newTag) return newTag.name;
            return tagsQuery.data?.find((t) => t.id === tagId)?.name ?? tagId;
        },
        [newlyCreatedTags, tagsQuery.data]
    );

    const getTagColor = useCallback(
        (tagId: string): string => {
            const newTag = newlyCreatedTags.get(tagId);
            if (newTag) return newTag.color;
            return tagsQuery.data?.find((t) => t.id === tagId)?.color ?? "#888888";
        },
        [newlyCreatedTags, tagsQuery.data]
    );

    const removeTag = useCallback((tagId: string) => {
        setSelectedTags((prev) => prev.filter((t) => t !== tagId));
    }, []);

    // ---------------------------------------------------------------------------
    // Form Actions
    // ---------------------------------------------------------------------------
    const resetForm = useCallback(() => {
        setValue("");
        // Restore defaults instead of clearing
        setPriority(defaults?.priority ?? 0);
        setSelectedTags(defaults?.tagIds ?? []);
        setDueDate(defaults?.dueDate ?? null);
        setAutocompleteMode("none");
        setTriggerPosition(null);
        setNewlyCreatedTags(new Map());
    }, [defaults?.tagIds, defaults?.dueDate, defaults?.priority]);

    const closeAutocomplete = useCallback(() => {
        setAutocompleteMode("none");
        setTriggerPosition(null);
    }, []);

    const handleSubmit = useCallback(() => {
        // Clean the value by removing any unfinished trigger sequences
        let cleanTitle = value;
        if (triggerPosition !== null) {
            cleanTitle =
                value.slice(0, triggerPosition) +
                value.slice(triggerPosition).replace(/^[!#]\S*/, "");
        }
        cleanTitle = cleanTitle.trim();

        if (!cleanTitle) return;

        onAddTask({
            title: cleanTitle,
            priority,
            tagIds: selectedTags,
            dueDate,
        });
        resetForm();
    }, [value, priority, selectedTags, dueDate, onAddTask, resetForm, triggerPosition]);

    const selectAutocompleteOption = useCallback(
        (optionId: string, isCreate: boolean) => {
            if (triggerPosition === null) return;

            // Remove the trigger and any partial text typed after it
            const beforeTrigger = value.slice(0, triggerPosition);
            const afterTriggerMatch = value.slice(triggerPosition).match(/^[!#]\S*\s?/);
            const afterTrigger = afterTriggerMatch
                ? value.slice(triggerPosition + afterTriggerMatch[0].length)
                : value.slice(triggerPosition + 1);

            if (autocompleteMode === "priority") {
                setPriority(parseInt(optionId) as 1 | 2 | 3);
                setValue(beforeTrigger + afterTrigger);
            } else if (autocompleteMode === "tag") {
                if (isCreate) {
                    const newTagName = optionId.replace("create:", "");
                    if (newTagName && newTagName !== "new") {
                        createTagMutation.mutate({
                            name: newTagName,
                            color: generateRandomTagColor(),
                        });
                    }
                } else {
                    setSelectedTags((prev) => [...prev, optionId]);
                }
                setValue(beforeTrigger + afterTrigger);
            }

            closeAutocomplete();
            inputRef.current?.focus();
        },
        [triggerPosition, value, autocompleteMode, createTagMutation, closeAutocomplete]
    );

    // ---------------------------------------------------------------------------
    // Return
    // ---------------------------------------------------------------------------
    return {
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
        triggerPosition,
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

        // Computed
        hasModifiers,

        // Loading states
        isCreatingTag: createTagMutation.isPending,
    };
}
