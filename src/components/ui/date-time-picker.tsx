"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { IconCalendar, IconX } from "@tabler/icons-react";

interface DateTimePickerProps {
    value: Date | null;
    onChange: (date: Date | null) => void;
    /** Placeholder text when no date is selected */
    placeholder?: string;
    /** Custom trigger element - if provided, replaces the default button */
    trigger?: React.ReactNode;
    /** Align the popover */
    align?: "start" | "center" | "end";
    /** Additional class for the trigger button */
    className?: string;
}

/**
 * Check if a date has a meaningful time set (not midnight 00:00:00)
 */
function hasTimeSet(date: Date | null): boolean {
    if (!date) return false;
    return date.getHours() !== 0 || date.getMinutes() !== 0;
}

/**
 * Format the time portion of a date as HH:MM for input[type="time"]
 */
function formatTimeForInput(date: Date): string {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}

/**
 * Format the display string for date (with optional time)
 */
export function formatDateTime(date: Date | null): string {
    if (!date) return "";
    if (hasTimeSet(date)) {
        return format(date, "MMM d, yyyy 'at' h:mm a");
    }
    return format(date, "MMM d, yyyy");
}

export function DateTimePicker({
    value,
    onChange,
    placeholder = "Select date",
    trigger,
    align = "start",
    className,
}: DateTimePickerProps) {
    const [open, setOpen] = React.useState(false);

    const handleDateSelect = (date: Date | undefined) => {
        if (!date) {
            onChange(null);
            return;
        }

        // Preserve existing time if we have one
        if (value && hasTimeSet(value)) {
            date.setHours(value.getHours(), value.getMinutes(), 0, 0);
        } else {
            // Reset to midnight if no time was set
            date.setHours(0, 0, 0, 0);
        }

        onChange(date);
    };

    const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const timeValue = e.target.value;
        if (!timeValue) return;

        const [hours, minutes] = timeValue.split(":").map(Number);
        const newDate = value ? new Date(value) : new Date();
        newDate.setHours(hours ?? 0, minutes ?? 0, 0, 0);
        onChange(newDate);
    };

    const handleClearTime = () => {
        if (value) {
            const newDate = new Date(value);
            newDate.setHours(0, 0, 0, 0);
            onChange(newDate);
        }
    };

    const handleClearDate = () => {
        onChange(null);
        setOpen(false);
    };

    const displayValue = formatDateTime(value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {trigger ?? (
                    <Button
                        variant="outline"
                        className={cn(
                            "justify-start text-left font-normal",
                            !value && "text-muted-foreground",
                            className
                        )}
                    >
                        <IconCalendar className="mr-2 h-4 w-4" />
                        {displayValue || placeholder}
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align={align}>
                <Calendar
                    mode="single"
                    selected={value ?? undefined}
                    defaultMonth={value ?? undefined}
                    onSelect={handleDateSelect}
                    initialFocus
                />

                {/* Time Section */}
                <div className="border-t px-3 py-2 space-y-2">
                    {/* Time Input with Clear Button */}
                    <div className="flex items-center gap-2">
                        <Input
                            type="time"
                            value={value && hasTimeSet(value) ? formatTimeForInput(value) : ""}
                            onChange={handleTimeChange}
                            placeholder="Add time"
                            className="flex-1 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                        {value && hasTimeSet(value) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
                                onClick={handleClearTime}
                            >
                                <IconX className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    {/* Clear Date Button */}
                    {value && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-muted-foreground"
                            onClick={handleClearDate}
                        >
                            <IconX className="mr-2 h-3 w-3" />
                            Clear date
                        </Button>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
