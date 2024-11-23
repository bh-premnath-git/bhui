import React from "react";
import { Link, useLocation, useNavigate, matchPath } from "react-router-dom";
import { ChevronDown } from "lucide-react";
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
import { CustomBuildToolbar } from "./CustomBuildToolbar";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {jwtDecode} from "jwt-decode";

interface HeaderProps {
  isAuthenticated?: boolean;
  logout?: () => void;
}

export function Header(props: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { pathname } = location;
  const token: string | null = sessionStorage?.getItem("token");
  const decoded: any = token ? jwtDecode(token) : null;

  const renderHeaderContent = (
    renderContent: (() => React.ReactNode) | React.ReactNode | string
  ) => {
    if (typeof renderContent === "function") {
      return renderContent();
    }
    if (React.isValidElement(renderContent)) {
      return renderContent;
    }
    if (typeof renderContent === "string") {
      return <div className="text-lg font-semibold">{renderContent}</div>;
    }
    return null;
  };

  return (
    <header className="flex items-center justify-between px-3 py-1 bg-white border border-1 border-b-gray-200">
      <div className="flex items-center">
        <img
          src={logo}
          className="h-8 w-8 cursor-pointer"
          sizes="(min-width: 904px) 32vw, 64vw"
          width={32}
          height={32}
          onClick={() => navigate("/dashboard")}
          alt="Logo"
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
              <AvatarImage
                src="https://assets.imgix.net/examples/pione.jpg"
                alt="User Avatar"
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium text-gray-700">
                {decoded?.email}
              </span>
              <span className="text-xs text-gray-500">{decoded?.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={props.logout}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

// Function to render header content based on the current path
export function renderingHeadContent(pathname: string) {
  const { layoutList }: any = useSelector(
    (state: RootState) => state.catalogApi
  );
  const { editProjectData } = useSelector(
    (state: RootState) => state.projectApi
  );
  const { userDataList } = useSelector((state: RootState) => state.userApi);
  const { editEnvironmentData } = useSelector(
    (state: RootState) => state.environmentApi
  );
  const { customerList } = useSelector(
    (state: RootState) => state.customerApi
  );
  const { selectedFlowFromList } = useSelector(
    (state: RootState) => state.flowApi
  );
  const { buildPipeLineDtl } = useSelector(
    (state: RootState) => state.buildPipeLineApi
  );

  const navigate = useNavigate();

  const capitalize = (str: string) => {
    return str
      .toLowerCase()
      .replace(/(?:^|\s|-)\S/g, (c) => c.toUpperCase());
  };

  const getBreadcrumbs = (path: string) => {
    const segments = path.split("/").filter((segment) => segment);
    const breadcrumbs: { label: string; href: string }[] = [];

    let pathAcc = "";

    segments.forEach((segment, index) => {
      // Handle dynamic segments for 'environment'
      if (
        segments[index - 1] === "environment" &&
        segment.match(/^\d+$/)
      ) {
        if (
          editEnvironmentData &&
          editEnvironmentData.bh_env_id === Number(segment)
        ) {
          segment =
            editEnvironmentData.bh_env_name ||
            editEnvironmentData.Environment_Name;
        }
      }

      // Handle dynamic segments for 'projects'
      if (segments[index - 1] === "projects" && segment.match(/^\d+$/)) {
        if (
          editProjectData &&
          editProjectData.bh_project_id === Number(segment)
        ) {
          segment =
            editProjectData.bh_project_name ||
            editProjectData.Project_Name;
        }
      }

      // Handle dynamic segments for 'customer' or 'customers'
      if (
        (segments[index - 1] === "customer" ||
          segments[index - 1] === "customers") &&
        segment.match(/^\d+$/)
      ) {
        const customerData = customerList.find(
          (customer: any) => customer.customer_id === Number(segment)
        );
        if (customerData) {
          segment =
            customerData.relation_ship_owner ||
            customerData.relation_ship_owner_email;
        }
      }

      // Handle dynamic segments for 'user' or 'users'
      if (
        (segments[index - 1] === "user" ||
          segments[index - 1] === "users") &&
        segment.match(/^\d+$/)
      ) {
        const userData = userDataList.find(
          (user: any) => user.bh_user_id === Number(segment)
        );
        if (userData) {
          const names = [
            userData.bh_user_first_name,
            userData.bh_user_middle_name,
            userData.bh_user_last_name,
          ].filter(Boolean);
          segment = names.join(" ");
        }
      }

      pathAcc += `/${segment}`;

      let breadcrumbLabel = segment;
      if (segment.match(/^\d+$/)) {
        breadcrumbLabel = segment;
      } else {
        breadcrumbLabel = capitalize(breadcrumbLabel.replace("-", " "));
      }

      breadcrumbs.push({
        label: breadcrumbLabel,
        href: pathAcc,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs(pathname);

  const breadcrumbRender = (
    <div className="w-2/5 font-bold">
      {breadcrumbs.length > 0 ? (
        breadcrumbs.map((breadcrumb, index) => (
          <span key={index}>
            {index > 0 && (
              <span className="mx-2 text-gray-500">&gt;</span>
            )}
            {index < breadcrumbs.length - 1 ? (
              <Link
                to={breadcrumb.href}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                {breadcrumb.label}
              </Link>
            ) : (
              <span className="text-gray-900 font-bold">
                {breadcrumb.label}
              </span>
            )}
          </span>
        ))
      ) : (
        <span>No Breadcrumbs</span>
      )}
    </div>
  );

  // Use matchPath for dynamic route matching
  const isManageFlowPath = matchPath(
    "/designers/manage-flow/:id",
    pathname
  );

  if (isManageFlowPath) {
    return <CustomToolbarComponent selectedData={selectedFlowFromList} />;
  }

  // Handle build-playground paths
  if (
    pathname === "/designers/build-playground/" ||
    pathname.includes("/designers/build-playground/")
  ) {
    return <CustomBuildToolbar buildPipeLineDtl={buildPipeLineDtl} />;
  }

  // Default to breadcrumb rendering
  return breadcrumbRender;
}
