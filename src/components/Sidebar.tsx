import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { menuList } from '@/configration/menuList';
import { jwtDecode } from 'jwt-decode';
import { Tooltip, Typography } from '@mui/material';

interface NavItem {
  icon: React.ReactNode;
  path: string;
  label: string;
  shortcut?: string;
  subPaths?: { 
    path: string; 
    label: string;
    icon: React.ReactNode;
    shortcut?: string;
  }[];
}

interface RoleAccess {
  [key: string]: string[]; // Mapping of role to allowed menu items
}

const roleAccess: RoleAccess = {
  'admin-user': ['Data Catalog', 'Admin Console'],
  'designer-user': ['Data Catalog', 'Designer'],
  'ops-user': ['Data Catalog', 'DataOps Hub'],
};

const getUserRoles = () => {
  const token: any = sessionStorage?.getItem("token");
  const decoded: any = token ? jwtDecode(token) : null;

  return decoded?.realm_access?.roles;
};
export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [shouldCollapse, setShouldCollapse] = useState(false);
  const { pathname } = useLocation();
  const userRoles = getUserRoles();
  const navigate = useNavigate();

  const allowedItems = Array.from(
    new Set(userRoles?.flatMap((role:any) => roleAccess[role] || []))
  );

  const filteredNavItems: NavItem[] = menuList.filter((item) =>
    allowedItems.includes(item.label)
  );

  useEffect(() => {
    const isDesignerFlowWithId = /^\/designers\/manage-flow\/.+$/.test(pathname);
    setIsMounted(!isDesignerFlowWithId && pathname !== '/login');
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) { // Command or Ctrl key
        const allItems = menuList.flatMap(item => 
          [item, ...(item.subPaths || [])]
        );
        
        const matchingItem = allItems.find(item => 
          item.shortcut?.toLowerCase().includes(event.key.toLowerCase())
        );

        if (matchingItem) {
          event.preventDefault();
          navigate(matchingItem.path);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  if (!isMounted) {
    return null;
  }

  return (
    <aside
      className={`fixed top-18 left-0 h-screen bg-custom-bg text-black transition-all duration-300 ease-in-out overflow-hidden z-20 ${
        isExpanded ? 'w-60' : 'w-16'
      }`}
      onMouseEnter={() => {
        if (!shouldCollapse) {
          setIsExpanded(true);
        }
      }}
      onMouseLeave={() => {
        setIsExpanded(false);
        setShouldCollapse(false);
      }}
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
                  className={`flex items-center justify-between p-2 rounded-lg text-black transition-colors duration-200
                    ${pathname === item.path
                      ? 'bg-gray-100 text-primary-600 font-semibold'
                      : 'hover:bg-gray-50'
                    }
                    ${item.subPaths ? 'font-semibold' : ''}
                  `}
                >
                  <div className="flex items-center">
                    <span className="flex items-center min-w-[22px]">{item.icon}</span>
                    <span
                      className={`ml-3 whitespace-nowrap transition-all duration-300 ${
                        isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {isExpanded && item.shortcut && (
                    <Typography
                      variant="caption"
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                        color: 'text.secondary',
                        fontSize: '0.6875rem',
                        fontFamily: 'monospace'
                      }}
                    >
                      {item.shortcut}
                    </Typography>
                  )}
                </Link>

                {item.subPaths && (
                  <ul className="mt-1 space-y-1">
                    {item.subPaths.map((subPath) => (
                      <li key={subPath.path}>
                        <Tooltip 
                          title={!isExpanded ? `${subPath.label} ${subPath.shortcut}` : ""}
                          placement="right"
                          arrow
                        >
                          <Link
                            to={subPath.path}
                            className={`flex items-center justify-between p-2 text-sm transition-colors duration-200
                              relative group rounded-lg font-normal
                              ${pathname === subPath.path
                                ? 'bg-primary-50 text-primary-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                              }
                            `}
                          >
                            <div className="flex items-center">
                              <span className={`flex items-center min-w-[22px] ${!isExpanded ? 'mx-0' : ''}`}>
                                {subPath.icon}
                              </span>
                              <span 
                                className={`whitespace-nowrap transition-all duration-300 ml-3
                                  ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 w-0 -translate-x-4'}
                                `}
                              >
                                {subPath.label}
                              </span>
                            </div>
                            {isExpanded && subPath.shortcut && (
                              <Typography
                                variant="caption"
                                sx={{
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  bgcolor: 'action.hover',
                                  color: 'text.secondary',
                                  fontSize: '0.6875rem',
                                  fontFamily: 'monospace'
                                }}
                              >
                                {subPath.shortcut}
                              </Typography>
                            )}
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
