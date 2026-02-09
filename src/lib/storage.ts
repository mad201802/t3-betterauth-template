/**
 * Central localStorage utility with error management
 * Provides type-safe access to localStorage with fallbacks
 */

type StorageKey = "todo:dateDisplayMode";

interface StorageSchema {
    "todo:dateDisplayMode": "date" | "relative";
}

class LocalStorageManager {
    private isAvailable: boolean;

    constructor() {
        this.isAvailable = this.checkAvailability();
    }

    /**
     * Check if localStorage is available (handles SSR and private browsing)
     */
    private checkAvailability(): boolean {
        if (typeof window === "undefined") return false;

        try {
            const testKey = "__storage_test__";
            window.localStorage.setItem(testKey, testKey);
            window.localStorage.removeItem(testKey);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get a value from localStorage with type safety
     */
    get<K extends StorageKey>(key: K, defaultValue: StorageSchema[K]): StorageSchema[K] {
        if (!this.isAvailable) return defaultValue;

        try {
            const item = window.localStorage.getItem(key);
            if (item === null) return defaultValue;
            return JSON.parse(item) as StorageSchema[K];
        } catch (error) {
            console.warn(`[localStorage] Failed to get "${key}":`, error);
            return defaultValue;
        }
    }

    /**
     * Set a value in localStorage with type safety
     */
    set<K extends StorageKey>(key: K, value: StorageSchema[K]): boolean {
        if (!this.isAvailable) return false;

        try {
            window.localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`[localStorage] Failed to set "${key}":`, error);
            return false;
        }
    }

    /**
     * Remove a value from localStorage
     */
    remove(key: StorageKey): boolean {
        if (!this.isAvailable) return false;

        try {
            window.localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn(`[localStorage] Failed to remove "${key}":`, error);
            return false;
        }
    }

    /**
     * Check if localStorage is currently available
     */
    get available(): boolean {
        return this.isAvailable;
    }
}

// Export a singleton instance
export const storage = new LocalStorageManager();

// Export types for consumers
export type { StorageKey, StorageSchema };
