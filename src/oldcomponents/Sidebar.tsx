import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import "../Styles/MenuItem.css";
import { COLORS } from '../Utils/constants';

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  link: string;
  submenu?: { name: string; link: string }[];
}

const Sidebar: React.FC<{ menuItems: MenuItem[] }> = ({ menuItems }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [menuClicked, setMenuClicked] = useState(false);
  const location = useLocation();
  const { pathname } = location;

  const handleMouseEnter = () => {
    if (!menuClicked) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMenuClicked(false);
  };

  // Collapse sidebar when pathname changes
  useEffect(() => {
    setIsHovered(false);
    setMenuClicked(true);
  }, [pathname]);

  const pathsToHideSidebar = ['/'];
  const hideSidebar = pathsToHideSidebar.includes(pathname);

  const filteredMenuItems = menuItems.filter(item => item.name !== 'Home');

  if (hideSidebar) {
    return null;
  } else {
    return (
      <div
        className="sidebar mt-3"
        style={{
          width: isHovered ? 280 : 80,
          backgroundColor: COLORS.SidebarBg
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <ul
          className='text-dark mx-2'
          style={{ textAlign: isHovered ? 'start' : 'center' }}
        >
          {filteredMenuItems.map((menuItem, index) => {
            // Check if current pathname matches menuItem link or any of its submenu links
            const isSubItemSelected =
              menuItem.submenu &&
              menuItem.submenu.some(subItem => pathname === subItem.link);

            const isMenuItemSelected = pathname === menuItem.link || isSubItemSelected;

            return (
              <li
                key={index}
                className={`${menuItem.submenu ? 'has-submenu' : ''} ${
                  isMenuItemSelected ? 'selected' : ''
                }`}
              >
                <Link
                  to={menuItem.link}
                  className={`text-dark sidebar-link ${
                    isMenuItemSelected ? 'selected-link' : ''
                  }`}
                >
                  {menuItem.icon}
                  {isHovered && (
                    <span className="sidebar-text px-2 h6">{menuItem.name}</span>
                  )}
                </Link>
                {menuItem.submenu && isHovered && (
                  <ul className="submenu">
                    {menuItem.submenu.map((subItem, subIndex) => {
                      const isSubItemActive = pathname === subItem.link;

                      return (
                        <li
                          key={subIndex}
                          className={`${isSubItemActive ? 'selected' : ''}`}
                        >
                          <Link
                            to={subItem.link}
                            className={`submenu-link ${
                              isSubItemActive ? 'selected-link' : ''
                            }`}
                          >
                            <span style={{ marginRight: '16px' }}></span>
                            {subItem.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
};

export default Sidebar;
