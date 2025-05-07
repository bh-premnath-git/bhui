import {
  Database,
  LayoutDashboard,
  Settings,
  Network,
  GitBranch,
  Package,
  GitPullRequest,
  AlertCircle,
  Share2,
  Users,
  FolderGit2,
  Settings2,
  Cable,
  Search,
  BarChart,
  NotebookText,
  BookMarked
} from "lucide-react";
import type { NavItem, NavigationItem } from "@/types/navigation";
import { ROUTES } from "./routes";

export const navigationItems: NavItem[] = [
  {
    title: "Data Catalog",
    icon: Database,
    path: ROUTES.DATA_CATALOG,
  },
  {
    title: "Data Xplorer",
    icon: BarChart,
    path: `${ROUTES.DATA_CATALOG}/xplorer`,
    subItems: [],
    actions: [
      { icon: 'ellipsis', action: 'menu' }
    ]
  },

  {
    title: "Designer",
    icon: Network,
    path: ROUTES.DESIGNERS.INDEX,
    subItems: [
      {
        title: "Data Pipelines",
        icon: Share2,
        path: ROUTES.DESIGNERS.BUILD_PIPELINE,
        parent: ROUTES.DESIGNERS.INDEX,
      },
      {
        title: "Data Flow",
        icon: GitBranch,
        path: ROUTES.DESIGNERS.MANAGE_FLOW,
        parent: ROUTES.DESIGNERS.INDEX,
      },
      {
        title: "Notebooks",
        icon: NotebookText,
        path: ROUTES.DESIGNERS.NOTEBOOK,
        parent: ROUTES.DESIGNERS.INDEX,
      },
    ],
  },
  {
    title: "DataOps Hub",
    icon: LayoutDashboard,
    path: ROUTES.DATAOPS.INDEX,
    subItems: [
      {
        title: "Ops Hub",
        icon: Package,
        path: ROUTES.DATAOPS.OPS_HUB,
        parent: ROUTES.DATAOPS.INDEX,
      },
      {
        title: "Alerts Hub",
        icon: AlertCircle,
        path: ROUTES.DATAOPS.ALERTS,
        parent: ROUTES.DATAOPS.INDEX,
      },
      {
        title: "Manage Releases",
        icon: GitPullRequest,
        path: ROUTES.DATAOPS.RELEASE,
        parent: ROUTES.DATAOPS.INDEX,
      },
    ],
  },
  {
    title: "Admin Console",
    icon: Settings,
    path: ROUTES.ADMIN.INDEX,
    subItems: [
      {
        title: "Manage Users",
        icon: Users,
        path: ROUTES.ADMIN.USERS.INDEX,
        parent: ROUTES.ADMIN.INDEX,
      },
      {
        title: "Manage Projects",
        icon: FolderGit2,
        path: ROUTES.ADMIN.PROJECTS.INDEX,
        parent: ROUTES.ADMIN.INDEX,
      },
      {
        title: "Manage Environments",
        icon: Settings2,
        path: ROUTES.ADMIN.ENVIRONMENT.INDEX,
        parent: ROUTES.ADMIN.INDEX,
      },
      {
        title: "Manage Connections",
        icon: Cable,
        path: ROUTES.ADMIN.CONNECTION.INDEX,
        parent: ROUTES.ADMIN.INDEX
      },
      {
        title: "Manage Prompts",
        icon: BookMarked,
        path: ROUTES.ADMIN.PROMPT.INDEX,
        parent: ROUTES.ADMIN.INDEX
      }
    ],
  },
];

// Helper functions for navigation
export const findNavigationItem = (path: string, items: NavItem[]): NavigationItem | undefined => {
  for (const item of items) {
    if (item.path === path) return item;
    if (item.subItems) {
      const found = findNavigationItem(path, item.subItems);
      if (found) return found;
    }
  }
  return undefined;
};

export const getAllPaths = (items: NavItem[]): string[] => {
  return items.reduce((paths: string[], item) => {
    paths.push(item.path);
    if (item.subItems) {
      paths.push(...getAllPaths(item.subItems));
    }
    return paths;
  }, []);
};