/**
 * Navigation configuration for the sidebar
 *
 * @module constants/navigation
 * @description Centralized navigation configuration. Modify this file to customize
 * the sidebar navigation structure for your SaaS application.
 */

import {
  IconDashboard,
  IconSettings,
  IconHelp,
} from "@tabler/icons-react";
import { APP_CONFIG } from "@/config";
import type { NavItem } from "@/types";

/**
 * Main navigation items - shown at the top of the sidebar
 */
export const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: APP_CONFIG.routes.dashboard,
    icon: IconDashboard,
  },
];

/**
 * Secondary navigation items - shown at the bottom of the sidebar
 */
export const secondaryNavItems: NavItem[] = [
  {
    title: "Settings",
    url: APP_CONFIG.routes.accountSettings,
    icon: IconSettings,
  },
  {
    title: "Get Help",
    url: "#",
    icon: IconHelp,
  },
];
