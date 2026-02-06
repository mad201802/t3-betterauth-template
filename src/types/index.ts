/**
 * Shared TypeScript types for the application
 *
 * @module types
 * @description Central location for shared type definitions used across the app.
 * Keep component-specific types in their respective files, only shared types here.
 */

// =============================================================================
// Auth Types
// =============================================================================

/**
 * User account linked to an authentication provider
 */
export interface LinkedAccount {
  accountId: string;
  providerId: string;
  createdAt: Date;
}

/**
 * Session type from BetterAuth - re-exported for convenience
 * For the full session type, import from @/server/better-auth/config
 */
export type { Session } from "@/server/better-auth/config";

// =============================================================================
// Navigation Types
// =============================================================================

import type { Icon } from "@tabler/icons-react";

export interface NavGroup {
  title?: string;
  items: NavItem[];
}

/**
 * Navigation item for the sidebar
 */
export interface NavItem {
  title: string;
  description?: string;
  url: string;
  icon?: Icon;
  isActive?: boolean;
  expanded?: boolean; // For collapsible items, whether they are expanded by default
  items?: NavItem[];
}

// =============================================================================
// UI Types
// =============================================================================

/**
 * Common props for components that support className
 */
export interface ClassNameProp {
  className?: string;
}

/**
 * Common props for components with children
 */
export interface ChildrenProp {
  children: React.ReactNode;
}
