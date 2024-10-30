
export const menuList = [
    {
        label: "Data Catalog",
        icon: <img src="/assets/menu/catalog.png" alt="data-catalog" width={20} height={20} />,
        path: "/DataCatalog"
    },
    {
        label: "Designer",
        icon: <img src="/assets/menu/designer.png" alt="Designer"  width={20} height={20} />,
        path: "/designers",
        subPaths: [
            { label: "Build Data Pipelines", path: "/AllBuildDataPipeLine" },
            { label: "Manage Flow", path: "/designer/manage-flow" },
        ]
    },
    {
        label: "DataOps Hub",
        icon: <img src="/assets/menu/dataops.png" alt="DataOps"  width={20} height={20} />,

        path: "/dashboard",
        subPaths: [
            { label: "Ops Hub", path: "/dataops-hub/ops-hub" },
            { label: "Explorer", path: "/dataops-hub/explorer" },
            { label: "Alerts", path: "/alerts" },
            { label: "Bundle", path: "/bundle" },
        ]
    },
    {
        label: "Admin Console",
        icon: <img src="/assets/menu/admin.svg" alt="DataOps"  width={20} height={20} />,
        path: "/admin-console"
    },
]