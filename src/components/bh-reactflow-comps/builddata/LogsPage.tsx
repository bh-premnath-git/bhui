import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"

interface Log {
  timestamp: string
  message: string
  level: "info" | "error" | "warning"
}

interface TerminalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  terminalLogs?: Log[]
  proplesLogs?: Log[]
  defaultHeight?: string
  minHeight?: string
}

export const Terminal: React.FC<TerminalProps> = ({
  isOpen,
  onClose,
  title = "Logs",
  terminalLogs = [],
  proplesLogs = [],
  defaultHeight = "40%",
  minHeight = "40px",
}) => {
  const [isMinimized, setIsMinimized] = React.useState(false)
  const [isMaximized, setIsMaximized] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"terminal" | "proples">(
    "terminal",
  )
  /**
   * Instead of querying the DOM for `.MuiDrawer-paper`,
   * we store a local height state and apply it to our container.
   */
  const [height, setHeight] = React.useState(defaultHeight)

  React.useEffect(() => {
    // Whenever we close, reset states so re-opening is fresh
    if (!isOpen) {
      setIsMinimized(false)
      setIsMaximized(false)
      setHeight(defaultHeight)
    }
  }, [isOpen, defaultHeight])

  React.useEffect(() => {
    if (!isOpen) {
      document.body.setAttribute('data-scroll-locked', '1');
      document.body.style.pointerEvents = 'auto !important';
    } else {
      document.body.removeAttribute('data-scroll-locked');
      document.body.style.pointerEvents = 'auto !important';
    }

    return () => {
      // Clean up the attribute when the component is unmounted or when isOpen changes
      document.body.removeAttribute('data-scroll-locked');
    };
  }, [isOpen]);

  const handleMinimize = () => {
    setIsMinimized(true)
    setIsMaximized(false)
    setHeight(minHeight)
  }

  const handleMaximize = () => {
    setIsMinimized(false)
    setIsMaximized((prev) => !prev)
    setHeight((prev) => (prev === "100%" ? defaultHeight : "100%"))
  }

  const handleRestore = () => {
    setIsMinimized(false)
    setIsMaximized(false)
    setHeight(defaultHeight)
  }

  return (
    <Sheet
      open={isOpen}
      // If the Sheet is closed by clicking outside or pressing ESC, call onClose.
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <SheetContent
        // Anchor it to the bottom
        side="bottom"
        // We'll override a lot of styles via Tailwind classes:
        className={cn(
          "p-0", // remove default padding
          "border-t", // top border
          "rounded-t-lg", // top corners
          "overflow-hidden", // clip content
          "transition-[height] duration-300 ease-in-out", // animate height
          "disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        )}
        // We'll set the inline style for our dynamic height
        style={{
          height,
          zIndex: 9999, // Ensure the terminal is above other elements
          pointerEvents: isOpen && document.body.getAttribute('data-scroll-locked') === '1' ? 'auto' : 'none', // Allow interactions when open and data-scroll-locked is "1"
        }}
      >
        {/* Header-like area */}
        <div className="flex flex-col h-full">
          {/* Top Bar with "traffic lights" */}
          <div className="flex items-center gap-2 border-b px-3 py-1 bg-neutral-100">
            {/* Traffic Light Buttons */}
            <div className="flex gap-2 mr-2">
              {/* Red (Close) */}
              <div
                className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:opacity-80 cursor-pointer"
                onClick={onClose}
              />
              {/* Yellow (Minimize/Restore) */}
              <div
                className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:opacity-80 cursor-pointer"
                onClick={isMinimized ? handleRestore : handleMinimize}
              />
              {/* Green (Maximize/Restore) */}
              <div
                className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:opacity-80 cursor-pointer"
                onClick={handleMaximize}
              />
            </div>

            {/* Title centered */}
            <SheetHeader className="flex-1 text-center">
              <SheetTitle className="text-sm text-neutral-600 p-2">
                {title}
              </SheetTitle>
            </SheetHeader>
          </div>

          {/* Tabs (hide if minimized) */}
          {!isMinimized && (
            <Tabs
              value={activeTab}
              onValueChange={(val) =>
                setActiveTab(val as "terminal" | "proples")
              }
            >
              <TabsList className="border-b bg-neutral-100 w-full text-start justify-start">
                <TabsTrigger
                  value="terminal"
                  className="px-4 py-1 text-sm"
                >
                  Terminal
                </TabsTrigger>
                <TabsTrigger
                  value="proples"
                  className="px-4 py-1 text-sm"
                >
                  Proplems
                </TabsTrigger>
              </TabsList>

              <div
                className="flex-1 overflow-auto p-3 text-sm font-mono bg-white"
                // Custom scrollbars if desired
                style={{
                  lineHeight: "1.4rem",
                }}
              >
                <TabsContent value="terminal">
                  {terminalLogs.length > 0 ? (
                    terminalLogs.map((log, index) => (
                      <div
                        key={index}
                        className="mb-1 flex items-start"
                        style={{
                          color:
                            log.level === "error"
                              ? "#dc3545"
                              : log.level === "warning"
                              ? "#ffc107"
                              : "#28a745",
                        }}
                      >
                        <span className="text-neutral-500 mr-2">
                          {log.timestamp}
                        </span>
                        <span>{log.message}</span>
                      </div>
                    ))
                  ) : (
                    <div className="italic text-neutral-500">
                      No terminal logs available...
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="proples">
                  {proplesLogs.length > 0 ? (
                    proplesLogs.map((log, index) => (
                      <div
                        key={index}
                        className="mb-1 flex items-start"
                        style={{
                          color:
                            log.level === "error"
                              ? "#dc3545"
                              : log.level === "warning"
                              ? "#ffc107"
                              : "#28a745",
                        }}
                      >
                        <span className="text-neutral-500 mr-2">
                          {log.timestamp}
                        </span>
                        <span>{log.message}</span>
                      </div>
                    ))
                  ) : (
                    <div className="italic text-neutral-500">
                      No proples logs available...
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
