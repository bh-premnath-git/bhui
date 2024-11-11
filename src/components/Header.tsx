import React from "react";
import { ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "/assets/logo/fixLogo.svg";
import { CustomToolbarComponent } from "./CustomToolbar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { jwtDecode } from "jwt-decode";
import { useAppSelector } from '@/redux/hooks';
import { CustomBuildToolbar } from "./CustomBuildToolbar";

interface HeaderProps {
  isAuthenticated?: boolean;
  logout?: () => void;
}

export function Header(props: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const token: any = sessionStorage?.getItem("token");
  const decoded: any =token? jwtDecode(token):null;

  const renderHeaderContent = (renderContent: (() => React.ReactNode) | React.ReactNode | string) => {
    if (typeof renderContent === 'function') {
      return renderContent();
    }
    if (React.isValidElement(renderContent)) {
      return renderContent;
    }
    if (typeof renderContent === 'string') {
      return <div className="text-lg font-semibold">{renderContent}</div>;
    }
    return null;
  };

  return (
    <header className="flex items-center justify-between px-3 py-1 bg-white border border-1 border-b-gray-200 ">
      <div className="flex items-center">
        <img
          src={logo}
          className="h-8 w-8 cursor-pointer"
          sizes="(min-width: 904px) 32vw, 64vw"
          width={32}
          height={32}
          onClick={() => navigate("/dashboard")}
        />
        <div className="mx-4 h-8 w-px bg-gray-200" />
      </div>
      <div className="flex-grow">
        {renderHeaderContent(renderingHeadContent(pathname))}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 rounded-md px-3 py-2 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://assets.imgix.net/examples/pione.jpg" alt="John Doe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-gray-700">{decoded?.email}</span>
              <span className="text-xs text-gray-500">{decoded?.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={props.logout}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

function renderingHeadContent(content: string) {
  const { layoutList }: any = useSelector((state: RootState) => state.catalogApi);
  const { editProjectData } = useSelector((state: RootState) => state.projectApi);
  const { editEnvironmentData } = useSelector((state: RootState) => state.environmentApi);
  const { selectedFlowFromList } = useSelector(
    (state: RootState) => state.flowApi
  );
  const { buildPipeLineDtl } = useSelector(
    (state: RootState) => state.buildPipeLineApi
  );
  // console.log(content);
  if (content === "/dashboard") {
    return <span className="w-2/5 font-bold"><span className="font-light">DataOPS</span> &gt; Dashboard</span>;
  }
  if (content === "/admin-console") {
    return <span className="w-2/5 font-bold">Admin Console</span>;
  }
  if (content === "/all-projects") {
    return <span className="w-2/5 font-bold"><span className="font-light">Admin Console</span> &gt; Projects</span>;
  }
  if (content === "/all-projects/new") {
    return <span className="w-2/5 font-bold"><span className="font-light">Admin Console &gt; Projects &gt; </span> New</span>;
  }
  if (content.includes("/projects/")) {
    return <span className="w-2/5 font-bold"><span className="font-light">Admin Console &gt; Projects &gt;</span> {editProjectData.bh_project_name}</span>;
  }
  if (content === "/all-environment") {
    return <span className="w-2/5 font-bold"><span className="font-light">Admin Console</span> &gt; Environments</span>;
  }
  if (content === "/all-environment/new") {
    return <span className="w-2/5 font-bold"><span className="font-light">Admin Console &gt; Environments &gt; </span> New</span>;
  }
  if (content.includes("/environments/")) {
    return <span className="w-2/5 font-bold"><span className="font-light">Admin Console &gt; Environment &gt;</span> {editEnvironmentData.bh_env_name}</span>;
  }
  if (content === "/designer/manage-flow") {
    return <span className="w-2/5 font-bold"><span className="font-light">Designer</span> &gt; Manage Flow</span>;
  }
  if (content === "/DataCatalog") {
    return <span className="w-2/5 font-bold"> Data Catalog</span>;
  }
  if (content === "/DataCatalog/schema") {
    return <span className="w-2/5 font-bold">Catalog &gt; {layoutList[0]?.data_src_lyt_name} &gt; Schema</span>;
  }
  if (content === "/AllUsers") {
    return <span className="w-2/5 font-bold"><span className="font-light">Admin Console </span>&gt; Manage Data Platform User</span>;
  }
  if (content === "/AddUser") {
    return <span className="w-2/5 font-bold"><span className="font-light">Admin Console &gt; Manage Data Platform User </span>&gt; Add User</span>;
  }
  if (content === "/AllCustomers") {
    return <span className="w-2/5 font-bold"><span className="font-light">Admin Console &gt; </span> Manage Customer </span>;
  }
  if (content === "/AddCustomers") {
    return <span className="w-2/5 font-bold"><span className="font-light">Admin Console &gt; Manage Customer </span> &gt; Add Customer</span>;
  }
  if (content === "/AllBuildDataPipeLine") {
    return <span className="w-2/5 font-bold"><span className="font-light">Designer </span> &gt; Build Data Pipeline</span>;
  }
  if (content === "/dataops-hub/ops-hub") {
    return <span className="w-2/5 font-bold"><span className="font-light">Dataops Hub </span> &gt; Ops Hub</span>;
  }
  if (content === "/alerts") {
    return <span className="w-2/5 font-bold"><span className="font-light">Dataops Hub </span> &gt; Alert Hub</span>;
  }
  if (content === "/bundle") {
    return <span className="w-2/5 font-bold">Manage Releases</span>;
  }
  if (content === "/CreateBundle") {
    return <span className="w-2/5 font-bold"><span className="font-light">Manage Releases </span> &gt; Create Bundle</span>;
  }
  if (content === "/ReleaseBundle") {
    return <span className="w-2/5 font-bold"><span className="font-light">Manage Releases </span> &gt; Release Bundle</span>;
  }
  if (content === "/designer/flow-playground") {
    return <CustomToolbarComponent selectedData={selectedFlowFromList} />
  }
  if (content === "/BuildPlayGround") {
    return <CustomBuildToolbar buildPipeLineDtl={buildPipeLineDtl} />
  }
  return "";
}