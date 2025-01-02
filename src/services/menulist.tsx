import { FaRegFile } from "react-icons/fa";
import { FiHome } from "react-icons/fi";
import { TiFlowSwitch } from "react-icons/ti";
import { MdOutlinePodcasts } from "react-icons/md";
import { MdOutlinePerson } from "react-icons/md";

export const menuList = [
    {
        label: "Home",
        icon: <FiHome className='h5' />,
        path: "/dashboard"
    },
    {
        label: "Data Catalog",
        icon: <FaRegFile className='h5' />,
        path: "/data-catalog"
    },
    {
        label: "Designer",
        icon: <TiFlowSwitch className='h5' />,
        path: "/designer",
        subPaths: [
            { label: "Onboard Data", path: "/designer/onboard-data" },
            { label: "Build Data Pipelines", path: "/designer/build-data-pipe-line" },
            { label: "Code Data Pipelines", path: "/designer/code-data-pipelines" },
            { label: "Manage Flow", path: "/designers/manage-flow" },
            { label: "Publish Data", path: "/designer/publish-data" }
        ]
    },
    {
        label: "DataOps Hub",
        icon: <MdOutlinePodcasts className='h5' />,
        path: "/dataops-hub/dashboard",
        subPaths: [
            { label: "Ops Hub", path: "/dataops-hub/ops-hub" },
            { label: "Explorer", path: "/dataops-hub/explorer" },
            { label: "Alerts2", path: "/dataops-hub/alters" },
        ]
    },
    {
        label: "Admin Console",
        icon: <MdOutlinePerson className='h5' />,
        path: "/admin-console"
    },
    {
        label: "BigHammer AI",
        icon: <FaRegFile className='h5' />,
        path: "/bighammer-ai"
    },
]