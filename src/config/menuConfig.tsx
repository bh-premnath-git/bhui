import { 
    Database, 
    LayoutDashboard, 
    Settings, 
    PenTool,
    GitBranch,
    Package,
    GitPullRequest,
    AlertCircle,
    Share2,
    Users,
    FolderGit2,
    Settings2,
} from "lucide-react";
import { ReactElement } from "react";

interface SubPath {
    label: string;
    path: string;
    icon: ReactElement;
}

interface MenuItem {
    label: string;
    icon: ReactElement;
    path: string;
    subPaths?: SubPath[];
}

export const menuList: MenuItem[] = [
    {
        label: "Data Catalog",
        icon: <Database size={20} />,
        path: "/data-catalog",
    },
    {
        label: "Designer",
        icon: <PenTool size={20} />,
        path: "/designers",
        subPaths: [
            { 
                label: "Build Data Pipelines", 
                path: "/designers/build-datapipeline/",
                icon: <Share2 size={18} />,
            },
            { 
                label: "Manage Flow", 
                path: "/designers/manage-flow",
                icon: <GitBranch size={18} />,
            },
        ]
    },
    {
        label: "DataOps Hub",
        icon: <LayoutDashboard size={20} />,
        path: "/dashboard",
        subPaths: [
            { 
                label: "Ops Hub", 
                path: "/dataops-hub/ops-hub",
                icon: <Package size={18} />,
            },
            { 
                label: "Alerts Hub", 
                path: "/dataops-hub/alerts",
                icon: <AlertCircle size={18} />,
            },
            { 
                label: "Manage Releases", 
                path: "/dataops-hub/release-bundle",
                icon: <GitPullRequest size={18} />,   
            },
        ]
    },
    {
        label: "Admin Console",
        icon: <Settings size={20} />,
        path: "/admin-console",
        subPaths: [
            { 
                label: "Manage Users", 
                path: "/admin-console/users",
                icon: <Users size={18} />,
            },
            { 
                label: "Manage Projects", 
                path: "/admin-console/projects",
                icon: <FolderGit2 size={18} />,
            },
            { 
                label: "Manage Environments", 
                path: "/admin-console/environment",
                icon: <Settings2 size={18} />,
            },
        ]
    }
];