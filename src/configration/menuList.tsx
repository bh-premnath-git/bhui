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
    Network
} from "lucide-react";

export const menuList = [
    {
        label: "Data Catalog",
        icon: <Database size={20} />,
        path: "/DataCatalog"
    },
    {
        label: "Designer",
        icon: <PenTool size={20} />,
        path: "/designers",
        subPaths: [
            { 
                label: "Build Data Pipelines", 
                path: "/designers/build-datapipeline/",
                icon: <Share2 size={18} />
            },
            { 
                label: "Manage Flow", 
                path: "/designers/manage-flow",
                icon: <GitBranch size={18} />
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
                icon: <Package size={18} />
            },
            { 
                label: "Alerts", 
                path: "/alerts",
                icon: <AlertCircle size={18} />
            },
            { 
                label: "Manage Releases", 
                path: "/dataops-hub/release-bundle",
                icon: <GitPullRequest size={18} />
            },
        ]
    },
    {
        label: "Admin Console",
        icon: <Settings size={20} />,
        path: "/admin-console"
    },
]