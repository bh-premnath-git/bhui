import { FaRegFile } from "react-icons/fa";
import { TiFlowSwitch } from "react-icons/ti";
import { MdOutlinePodcasts } from "react-icons/md";
import { MdOutlinePerson } from "react-icons/md";

export const menuList = [
    {
        label: "Data Catalog",
        icon: <FaRegFile className='h4' />,
        path: "/data-catalog"
    },
    {
        label: "Designer",
        icon: <TiFlowSwitch className='h4' />,
        path: "/designer",
        subPaths: [
           /*  { label: "Onboard Data", path: "/designer/onboard-data" }, */
            { label: "Build Data Pipelines", path: "/designer/build-data-pipe-line" },
           /*  { label: "Code Data Pipelines", path: "/designer/code-data-pipelines" }, */
            { label: "Manage Flow", path: "/designer/manage-flow" },
           /*  { label: "Publish Data", path: "/designer/publish-data" } */
        ]
    },
    {
        label: "DataOps Hub",
        icon: <MdOutlinePodcasts className='h4' />,
        path: "/dataops-hub/dashboard",
        subPaths: [
            { label: "Ops Hub", path: "/dataops-hub/ops-hub" },
            { label: "Explorer", path: "/dataops-hub/explorer" },
            { label: "Alerts", path: "/alerts" },
        ]
    },
    {
        label: "Admin Console",
        icon: <MdOutlinePerson className='h4' />,
        path: "/admin-console"
    },
]