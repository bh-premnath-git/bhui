import { 
    Database, 
    LayoutDashboard, 
    Settings, 
    PenTool,
    GitBranch,
    Bell,
    Package,
    TableProperties,
    GitPullRequest,
    AlertCircle,
    Share2,
    Users,
    Building2,
    FolderGit2,
    Settings2
} from "lucide-react";

export const menuList = [
    {
        label: "Data Catalog",
        icon: <Database size={20} />,
        path: "/data-catalog",
        shortcut: "⌘D"
    },
    {
        label: "Designer",
        icon: <PenTool size={20} />,
        path: "/designers",
        shortcut: "⌘E",
        subPaths: [
            { 
                label: "Build Data Pipelines", 
                path: "/designers/build-datapipeline/",
                icon: <Share2 size={18} />,
                shortcut: "⌘B"
            },
            { 
                label: "Manage Flow", 
                path: "/designers/manage-flow",
                icon: <GitBranch size={18} />,
                shortcut: "⌘M"
            },
        ]
    },
    {
        label: "DataOps Hub",
        icon: <LayoutDashboard size={20} />,
        path: "/dashboard",
        shortcut: "⌘H",
        subPaths: [
            { 
                label: "Ops Hub", 
                path: "/dataops-hub/ops-hub",
                icon: <Package size={18} />,
                shortcut: "⌘O"
            },
            { 
                label: "Alerts Hub", 
                path: "/dataops-hub/alerts",
                icon: <AlertCircle size={18} />,
                shortcut: "⌘A"
            },
            { 
                label: "Manage Releases", 
                path: "/dataops-hub/release-bundle",
                icon: <GitPullRequest size={18} />,
                shortcut: "⌘R"
            },
        ]
    },
    {
        label: "Admin Console",
        icon: <Settings size={20} />,
        path: "/admin-console",
        shortcut: "⌘K",
        subPaths: [
            { 
                label: "Manage Users", 
                path: "/admin-console/users",
                icon: <Users size={18} />,
                shortcut: "⌘U"
            },
            { 
                label: "Manage Customers", 
                path: "/admin-console/customers",
                icon: <Building2 size={18} />,
                shortcut: "⌘Q"
            },
            { 
                label: "Manage Projects", 
                path: "/admin-console/projects",
                icon: <FolderGit2 size={18} />,
                shortcut: "⌘P"
            },
            { 
                label: "Manage Environments", 
                path: "/admin-console/environment",
                icon: <Settings2 size={18} />,
                shortcut: "⌘M"
            },
        ]
    },
]