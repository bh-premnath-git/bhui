# Current Implementation

## ProtectedLayout

The `ProtectedLayout` component serves as the top-level layout wrapper for authenticated routes. It composes the following elements:

- **`ThemeProvider`**: Provides theme context for light/dark mode
- **`SidebarProvider`**: Holds the sidebar state (expanded/collapsed, aside and drawer open/closed)
- **`LayoutWrapper`**: Defines the main flex-based layout:
  - Left: `Sidebar` (fixed width)
  - Center: `MainContentInternal` (content area with header and `<Outlet />` for nested routes)
  - Bottom Drawer: Rendered when `isBottomDrawerOpen` is `true`
  - Right Aside: Rendered when `isRightAsideOpen` is `true`