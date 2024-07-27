import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import "../styles/MenuItem.css";
import { COLORS } from '../utils/constants';

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  link: string;
  submenu?: { name: string; link: string }[];
}

const Sidebar: React.FC<{ menuItems: MenuItem[] }> = ({ menuItems }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null); // Track selected item
  const location = useLocation();
  const { pathname } = location;

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  const handleMenuItemClick = (itemName: string) => setSelectedItem(itemName);

  // Define an array of paths where the Sidebar should be hidden
  const pathsToHideSidebar = ['/'];

  // Check if the current path is in the array of paths to hide the Sidebar
  const hideSidebar = pathsToHideSidebar.includes(pathname);

  if (hideSidebar) {
    return null; // Return null if the Sidebar should be hidden
  }else{
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
        <ul className='text-dark mx-2' style={{ textAlign: isHovered ? 'start' : 'center' }}>
          {menuItems.map((menuItem, index) => (
            <Link key={index} to={menuItem.link} className='text-dark'>
  
              <li  className={`${menuItem.submenu ? 'sun' : 'hover'}  ${selectedItem === menuItem.name ? 'selected' : ''}`} onClick={() => handleMenuItemClick(menuItem.name)}>
                {menuItem.icon}
                {isHovered && <span className="sidebar-text px-2 h6">{menuItem.name}</span>}
                {menuItem.submenu && isHovered && (
                  <ul className="submenu">
                    {menuItem.submenu.map((subItem, subIndex) => (
                      <Link to={subItem.link} key={subIndex}>
                        <li  className='hover '>
                          <span style={{marginRight:'16px'}}></span>{subItem.name}</li>
                      </Link>
                    ))}
                  </ul>
                )}
              </li>
            </Link>
  
          ))}
        </ul>
      </div>
    );
  }

 
};

export default Sidebar;
