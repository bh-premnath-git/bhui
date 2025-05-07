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

### `MainContentInternal`

- Reads `isExpanded` from the sidebar context to adjust left margin (`ml-64` or `ml-20`)
- Renders a fixed header via the `Header` component
- Wraps the `<Outlet />` in a scrollable `<main>` area with `overflow-auto` and a calculated height (`h-[calc(100vh-64px)]`)

## RightAside

The `RightAside` component renders a slide-in panel on the right side of the screen. It receives:

- **`title`** (`string`, default: `'Details'`): The panel header title
- **`children`** (`ReactNode`): The panel content
- **`width`** (`string`, default: `w-70`): Tailwind width class
- **`className`** (`string`): Additional CSS classes

### Structure

```tsx
<aside
  className={cn(
    "relative flex flex-col h-full bg-background/95 backdrop-blur-sm border-l shadow-sm",
    "transition-all duration-300 ease-in-out",
    width,
    className
  )}
  data-state="open"
  style={{ zIndex: 25 }}
>
  {/* Collapse handle */}
  <Button ...>
    <ChevronRight />
  </Button>

  <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
    <h2 className="font-medium text-lg">{title}</h2>
    <Button ...>
      <X />
      <span className="sr-only">Close panel</span>
    </Button>
  </div>

  {/* Scrollable content */}
  <div className="flex-1 overflow-y-auto">
    {children}
  </div>
</aside>
```

- The root `<aside>` uses `h-full` to fill the available height (inherited from the parent flex container with `min-h-screen`)
- The content wrapper uses `flex-1` and `overflow-y-auto` so that overflowing content scrolls within the panel without increasing its height

## Scroll Behavior

- The overall layout uses `min-h-screen` on the top-level flex container, ensuring the panel is constrained to the viewport height
- Content inside the `RightAside` will scroll vertically when it exceeds the available height, thanks to `overflow-y-auto`
