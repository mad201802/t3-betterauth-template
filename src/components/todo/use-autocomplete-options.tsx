"use client";

import { useMemo } from "react";
import { IconFlag, IconPlus } from "@tabler/icons-react";
import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import {
    type AutocompleteMode,
    type AutocompleteOption,
    PRIORITY_CONFIG,
} from "./types";

// ============================================================================
// Priority Options
// ============================================================================

/** Get priority autocomplete options (static, derived from PRIORITY_CONFIG) */
export function usePriorityOptions(): AutocompleteOption[] {
    return useMemo(
        () =>
            ([1, 2, 3] as const).map((p) => ({
                id: PRIORITY_CONFIG[p].id,
                label: PRIORITY_CONFIG[p].label,
                color: PRIORITY_CONFIG[p].color,
                icon: <IconFlag className={cn("h-4 w-4", PRIORITY_CONFIG[p].color)} />,
            })),
        []
    );
}

// ============================================================================
// Tag Options
// ============================================================================

interface UseTagOptionsParams {
    selectedTags: string[];
    searchText: string;
}

/** Get tag autocomplete options with "create new" support */
export function useTagOptions({
    selectedTags,
    searchText,
}: UseTagOptionsParams): AutocompleteOption[] {
    const tagsQuery = api.todo.getTags.useQuery();

    return useMemo(() => {
        const existingTags: AutocompleteOption[] = (tagsQuery.data ?? [])
            .filter((tag) => !selectedTags.includes(tag.id))
            .map((tag) => ({
                id: tag.id,
                label: tag.name,
                color: tag.color,
                icon: (
                    <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                    />
                ),
            }));

        // Filter by search text
        const filtered = searchText
            ? existingTags.filter((opt) =>
                opt.label.toLowerCase().includes(searchText.toLowerCase())
            )
            : [...existingTags];

        // Check if the search text exactly matches an existing tag
        const exactMatch = existingTags.some(
            (tag) => tag.label.toLowerCase() === searchText.toLowerCase()
        );

        // Add "Create new tag" option if there's search text and no exact match
        if (searchText && !exactMatch) {
            filtered.push({
                id: `create:${searchText}`,
                label: `Create "${searchText}"`,
                icon: <IconPlus className="h-3 w-3 text-primary" />,
                color: "text-primary",
                isCreateNew: true,
            });
        }

        // If no tags at all and no search text, show helpful message
        if (existingTags.length === 0 && !searchText) {
            return [
                {
                    id: "create:new",
                    label: "Type to create a new tag",
                    icon: <IconPlus className="h-3 w-3 text-muted-foreground" />,
                    isCreateNew: false, // Informational only
                },
            ];
        }

        return filtered;
    }, [tagsQuery.data, selectedTags, searchText]);
}

// ============================================================================
// Combined Autocomplete Options
// ============================================================================

interface UseAutocompleteOptionsParams {
    mode: AutocompleteMode;
    selectedTags: string[];
    searchText: string;
}

/** Get filtered autocomplete options based on current mode */
export function useAutocompleteOptions({
    mode,
    selectedTags,
    searchText,
}: UseAutocompleteOptionsParams): AutocompleteOption[] {
    const priorityOptions = usePriorityOptions();
    const tagOptions = useTagOptions({ selectedTags, searchText });

    return useMemo(() => {
        if (mode === "none") return [];

        if (mode === "priority") {
            if (!searchText) return priorityOptions;
            return priorityOptions.filter((opt) =>
                opt.label.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        return tagOptions;
    }, [mode, searchText, priorityOptions, tagOptions]);
}
