import { CgNotes } from "react-icons/cg";
import { FaRegFile } from "react-icons/fa";
import { FiHome } from "react-icons/fi";
import { TiFlowSwitch } from "react-icons/ti";
import { MdOutlinePodcasts } from "react-icons/md";
import { MdOutlinePerson } from "react-icons/md";

export const menuList = [
    {
        name: "Home",
        icon: <FiHome className='h5' />,
        link: "/Home"
    },
    {
        name: "Data Catalog",
        icon: <FaRegFile className='h5' />,
        link: "/Data Catalog"
    },
    // {
    //     name: "Data Glossary",
    //     icon: <CgNotes className='h5' />,
    //     link: "/Data Glossary"
    // },
    {
        name: "Designer",
        icon: <TiFlowSwitch className='h5' />,
        link: "/Designers",
        submenu: [
            { name: "Onboard Data", link: "/Designer/Onboard Data" },
            { name: "Build Data Pipelines", link: "/Designer/Build Data Pipe Line" },
            { name: "Code Data Pipelines", link: "/Designer/Code Data Pipelines" },
            { name: "Manage Flow", link: "/Designer/Manage Flow" },
            { name: " Publish Data", link: "/Designer/Publish Data" }
        ]
    },
    {
        name: "DataOps Hub",
        icon: <MdOutlinePodcasts className='h5' />,
        link: "/DataOps Hub/Dashboard",
        submenu: [
            { name: "Ops Hub", link: "/DataOps Hub/Ops Hub" },
            { name: "Explorer", link: "/DataOps Hub/Explorer" },
            { name: "Alerts", link: "/Alerts" },
        ]
    },
    {
        name: "Admin Console",
        icon: <MdOutlinePerson className='h5' />,
        link: "/Admin Console"
    },
]