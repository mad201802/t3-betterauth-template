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
  IconChecklist,
  IconMan,
  IconZzz,
  IconSalad,
  IconBarbell,
  IconBrain,
  IconMoodEdit,
  IconNotebook,
  IconPlant2,
  IconMoneybag,
  IconMountain,
  IconHeartHandshake,
  IconHomeHeart,
  IconFriends,
  IconHome,
  IconPlus,
  IconBook,
} from "@tabler/icons-react";
import { APP_CONFIG } from "@/config";
import type { NavGroup, NavItem } from "@/types";

/**
 * Main navigation items - shown at the top of the sidebar
 */
export const mainNavGroups: NavGroup[] = [
  {
    items: [
      {
        title: "Dashboard",
        url: APP_CONFIG.routes.dashboard,
        icon: IconDashboard,
      },
      {
        title: "To Do",
        url: APP_CONFIG.routes.todo,
        icon: IconChecklist,
      },
    ],
  },
  {
    title: "LifeOS Core 5",
    items: [
      {
        title: "Body",
        description: "Track your sleep, nutrition, and more",
        url: "#",
        icon: IconMan,
        expanded: true,
        items: [
          {
            title: "Sleep",
            url: "#",
            icon: IconZzz,
          },
          {
            title: "Nutrition",
            url: "#",
            icon: IconSalad,
          },
          {
            title: "Sport",
            url: "#",
            icon: IconBarbell,
          },
        ],
      },
      {
        title: "Mind",
        description: "Track your mood, journaling, and more",
        url: "#",
        icon: IconBrain,
        expanded: true,
        items: [
          {
            title: "Journal",
            url: "#",
            icon: IconNotebook,
          },
          {
            title: "Meditation",
            url: "#",
            icon: IconPlant2,
          },
          {
            title: "Reading",
            url: "#",
            icon: IconBook,
          },
        ],
      },
      {
        title: "Connection",
        description: "Track your relationships, social activities, and more",
        url: "#",
        icon: IconHeartHandshake,
        expanded: true,
        items: [
          {
            title: "Family",
            url: "#",
            icon: IconHomeHeart,
          },
          {
            title: "Friends",
            url: "#",
            icon: IconFriends,
          },
        ],
      },
      {
        title: "Environment",
        description: "Track your living space, nature time, and more",
        url: "#",
        icon: IconHomeHeart,
        expanded: true,
        items: [
          {
            title: "Living Space",
            url: "#",
            icon: IconHome,
          },
        ],
      },
      {
        title: "Missions",
        description:
          "Define your core mission and values to stay aligned with what matters most",
        url: "#",
        icon: IconMountain,
        expanded: true,
        items: [
          {
            title: "University",
            url: "#",
            icon: IconBrain,
          },
          {
            title: "Work",
            url: "#",
            icon: IconBrain,
          },
          {
            title: "Create new Mission",
            url: "#",
            icon: IconPlus,
          },
        ],
      },
      {
        title: "Finance",
        description: "Track your expenses, budgets, and more",
        url: "#",
        icon: IconMoneybag,
      },
    ],
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
