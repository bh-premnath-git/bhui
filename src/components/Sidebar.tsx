import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { menuList } from '@/configration/menuList'
interface NavItem {
  icon: React.ReactNode
  path: string
  label: string
  subPaths?: { path: string; label: string }[]
}


const navItems: NavItem[] = menuList

export function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [shouldCollapse, setShouldCollapse] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <aside
      className={`fixed top-18 left-0 h-screen bg-custom-bg text-black transition-all duration-300 ease-in-out overflow-hidden z-10 ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
      onMouseEnter={() => {
        if (!shouldCollapse) {
          setIsExpanded(true)
        }
      }}
      onMouseLeave={() => {
        setIsExpanded(false)
        setShouldCollapse(false)
      }}
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="flex flex-col h-full p-2">
        <nav className="flex-1 mt-2 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path} className="relative">
                <Link
                  to={item.path}
                  className={`flex items-center p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 ${
                    pathname === item.path ? 'bg-gray-200' : ''
                  }`}
                  aria-current={pathname === item.path ? 'page' : undefined}
                  onClick={() => {
                    setIsExpanded(false)
                    setShouldCollapse(true)
                  }}
                >
                  <span className="min-w-[24px] mr-3 text-black">{item.icon}</span>
                  <span
                    className={`whitespace-nowrap transition-all duration-300 text-black ${
                      isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
                {item.subPaths && (
                  <ul
                    className={`ml-6 space-y-1 overflow-hidden transition-all duration-300 ${
                      isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                    role="menu"
                    aria-label={`${item.label} submenu`}
                  >
                    {item.subPaths.map((subPath) => (
                      <li key={subPath.path} role="none">
                        <Link
                          to={subPath.path}
                          className={`flex items-center p-1.5 text-sm text-black rounded-md hover:bg-gray-200 transition-colors duration-200 ${
                            pathname === subPath.path ? 'bg-gray-200' : ''
                          }`}
                          role="menuitem"
                          aria-current={pathname === subPath.path ? 'page' : undefined}
                          onClick={() => {
                            setIsExpanded(false)
                            setShouldCollapse(true)
                          }}
                        >
                          <span className="w-1.5 h-1.5 mr-2 bg-gray-500 rounded-full"></span>
                          <span className="whitespace-nowrap">{subPath.label}</span>
                        </Link>
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
  )
}
