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

/**
 * Navigation item for the sidebar
 */
export interface NavItem {
  title: string;
  url: string;
  icon?: Icon;
  isActive?: boolean;
  items?: NavSubItem[];
}

/**
 * Sub-navigation item (nested under a NavItem)
 */
export interface NavSubItem {
  title: string;
  url: string;
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
