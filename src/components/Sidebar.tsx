import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { menuList } from '@/configration/menuList';
import { jwtDecode } from 'jwt-decode';
import { Tooltip } from '@mui/material';

interface NavItem {
  icon: React.ReactNode;
  path: string;
  label: string;
  subPaths?: { 
    path: string; 
    label: string;
    icon: React.ReactNode;
  }[];
}

interface RoleAccess {
  [key: string]: string[]; // Mapping of role to allowed menu items
}

const roleAccess: RoleAccess = {
  'admin-user': ['BigHammer AI','Data Catalog', 'Admin Console'],
  'designer-user': ['BigHammer AI','Data Catalog', 'Designer'],
  'ops-user': ['BigHammer AI','Data Catalog', 'DataOps Hub'],
};

const getUserRoles = () => {
  const token: any = sessionStorage?.getItem("token");
  const decoded: any = token ? jwtDecode(token) : null;

  return decoded?.realm_access?.roles;
};

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { pathname } = useLocation();
  const userRoles = getUserRoles();

  // Determine allowed items based on user role
  const allowedItems = Array.from(
    new Set(userRoles?.flatMap((role: any) => roleAccess[role] || []))
  );

  const filteredNavItems: NavItem[] = menuList.filter((item) =>
    allowedItems.includes(item.label)
  );

  useEffect(() => {
    const isDesignerFlowWithId = /^\/designers\/manage-flow\/.+$/.test(pathname);
    setIsMounted(!isDesignerFlowWithId && pathname !== '/login');
  }, [pathname]);

  if (!isMounted) {
    return null;
  }

  return (
    <aside
      className={`
        fixed top-18 left-0 h-screen
        z-20
        transition-all duration-300 ease-in-out
        overflow-hidden
        ${isExpanded ? 'w-60' : 'w-16'}

        /* Sidebar background & text color 
           Use a light gray background to match the screenshot */
        bg-[#F6F6F7] text-[#1F1F1F]
      `}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="flex flex-col h-full p-2">
        <nav className="flex-1 mt-1 overflow-y-auto">
          <ul className="space-y-1">
            {filteredNavItems.map((item) => (
              <li key={item.path} className="relative">
                <Link
                  to={item.path}
                  className={`
                    flex items-center justify-between p-2 rounded-lg
                    transition-colors duration-200

                    /* Active state */
                    ${
                      pathname === item.path
                        ? 'bg-[#EBEBEC] text-[#000] font-semibold'
                        : 'hover:bg-[#EBEBEC]'
                    }
                    ${item.subPaths ? 'font-semibold' : ''}
                  `}
                >
                  <div className="flex items-center">
                    <span className="flex items-center min-w-[22px]">
                      {item.icon}
                    </span>
                    <span
                      className={`
                        ml-3 whitespace-nowrap transition-all duration-300
                        ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                      `}
                    >
                      {item.label}
                    </span>
                  </div>
                </Link>

                {item.subPaths && (
                  <ul className="mt-1 space-y-1">
                    {item.subPaths.map((subPath) => (
                      <li key={subPath.path}>
                        <Tooltip 
                          title={!isExpanded ? subPath.label : ""}
                          placement="right"
                          arrow
                        >
                          <Link
                            to={subPath.path}
                            className={`
                              flex items-center justify-between p-2 text-sm
                              transition-colors duration-200
                              relative group rounded-lg font-normal

                              /* Active/hover for sub-items */
                              ${
                                pathname === subPath.path
                                  ? 'bg-[#EBEBEC] text-[#000]'
                                  : 'text-[#4A4A4A] hover:bg-[#EBEBEC] hover:text-[#1F1F1F]'
                              }
                            `}
                          >
                            <div className="flex items-center">
                              <span
                                className={`flex items-center min-w-[22px] ${
                                  !isExpanded ? 'mx-0' : ''
                                }`}
                              >
                                {subPath.icon}
                              </span>
                              <span
                                className={`
                                  whitespace-nowrap transition-all duration-300 ml-3
                                  ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 w-0 -translate-x-4'}
                                `}
                              >
                                {subPath.label}
                              </span>
                            </div>
                          </Link>
                        </Tooltip>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
