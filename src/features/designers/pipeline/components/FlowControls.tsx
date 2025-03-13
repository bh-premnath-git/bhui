import React, { useState } from 'react'
import {
  BiZoomIn,
  BiZoomOut
} from 'react-icons/bi'
import {
  MdOutlineCenterFocusStrong,
  MdOutlineSkipNext,
  MdOutlineStop,
  MdSettings,
  MdTerminal,
  MdAlignHorizontalCenter,
  MdAlignVerticalCenter
} from 'react-icons/md'
import { HiOutlinePlay } from 'react-icons/hi'

// shadcn/ui imports (adjust import paths to match your project setup)
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

import { Terminal } from '@/components/bh-reactflow-comps/builddata/LogsPage';

interface Log {
  timestamp: string
  message: string
  level: 'info' | 'error' | 'warning'
}

interface FlowControlsProps {
  onZoomIn: () => void
  onZoomOut: () => void
  onCenter: () => void
  handleRunClick: () => void
  onStop: () => void
  onNext: () => void
  isPipelineRunning: boolean
  isLoading: boolean
  pipelineConfig: any
  terminalLogs?: Log[]
  proplesLogs?: Log[]
  onAlignHorizontal: () => void
  onAlignVertical: () => void
}

export const FlowControls: React.FC<FlowControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onCenter,
  handleRunClick,
  onStop,
  onNext,
  isPipelineRunning,
  isLoading,
  pipelineConfig,
  terminalLogs,
  proplesLogs,
  onAlignHorizontal,
  onAlignVertical,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLogsOpen, setIsLogsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  // --- SETTINGS (Sheet) ---
  const handleSettingsClick = () => {
    setIsSettingsOpen(true)
  }

  const handleCloseSettings = () => {
    setIsSettingsOpen(false)
  }

  // --- LOGS (Custom Terminal) ---
  const handleLogsClick = () => {
    setIsLogsOpen(true)
  }

  const handleCloseLogs = () => {
    setIsLogsOpen(false)
  }

  // --- MINIMIZE/MAXIMIZE EXAMPLE ---
  // If you have a shadcn "Sheet" or "Dialog" for logs/settings, 
  // you can reference it by a className or ref for dynamic sizing.
  const handleMinimize = () => {
    setIsMinimized(true)
    setIsMaximized(false)
    // Example: For a Sheet with class ".mySheetContent":
    const sheetEl = document.querySelector<HTMLElement>('.mySheetContent')
    if (sheetEl) {
      sheetEl.style.height = '40px'
    }
  }

  const handleMaximize = () => {
    setIsMinimized(false)
    setIsMaximized(!isMaximized)
    // Example: Toggle between 40% and 100% for a Sheet
    const sheetEl = document.querySelector<HTMLElement>('.mySheetContent')
    if (sheetEl) {
      sheetEl.style.height = isMaximized ? '40%' : '100%'
    }
  }

  const handleRestore = () => {
    setIsMinimized(false)
    setIsMaximized(false)
    const sheetEl = document.querySelector<HTMLElement>('.mySheetContent')
    if (sheetEl) {
      sheetEl.style.height = '40%'
    }
  }

  const actions = [
    { key: 'zoom-in', icon: BiZoomIn, handler: onZoomIn },
    { key: 'zoom-out', icon: BiZoomOut, handler: onZoomOut },
    { key: 'center', icon: MdOutlineCenterFocusStrong, handler: onCenter },
    { key: 'align-horizontal', icon: MdAlignHorizontalCenter, handler: onAlignHorizontal },
    { key: 'align-vertical', icon: MdAlignVerticalCenter, handler: onAlignVertical },
    { key: 'run', icon: HiOutlinePlay, handler: handleRunClick },
    { key: 'stop', icon: MdOutlineStop, handler: onStop },
    { key: 'next', icon: MdOutlineSkipNext, handler: onNext },
    { key: 'logs', icon: MdTerminal, handler: handleLogsClick },
  ]

  return (
    <>
      <div
        className="flex items-center bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 gap-1"
        style={{ zIndex: 100001 }}
      >
        {actions.map((action, index) => (
          <React.Fragment key={action.key}>
            {index > 0 && <div className="w-px h-6 bg-gray-200" />}
            <Button
              onClick={action.handler}
              variant="ghost"
              className="group relative flex items-center justify-center w-8 h-8 
                         hover:bg-gray-900 active:bg-gray-800 
                         transition-all duration-200 ease-in-out p-0"
              title={action.key
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
              disabled={
                (action.key === 'run' && isLoading) ||
                (action.key === 'next' && !isPipelineRunning)
              }
            >
              <span
                className="
                  absolute -top-10 scale-0 transition-all 
                  rounded bg-gray-800 p-2 text-xs text-white 
                  group-hover:scale-100
                "
              >
                {action.key
                  .split('-')
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
                <span
                  className="
                    absolute bottom-[-4px] left-1/2 -translate-x-1/2 
                    rotate-45 w-2 h-2 bg-gray-800
                  "
                />
              </span>
              <span className="text-gray-700 group-hover:text-white transition-colors">
                <action.icon
                  size={20}
                  className={
                    action.key === 'stop' && isPipelineRunning ? 'text-red-500' : ''
                  }
                />
              </span>
            </Button>
          </React.Fragment>
        ))}

        {/* Extra button to open Settings (shadcn Sheet) */}
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" onClick={handleSettingsClick} title="Settings">
              <MdSettings size={20} />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="mySheetContent">
            <SheetHeader>
              <SheetTitle>Settings</SheetTitle>
              <SheetDescription>
                Customize your pipeline settings here.
              </SheetDescription>
            </SheetHeader>
            {/* ... settings form or content ... */}
            <SheetFooter>
              <Button variant="secondary" onClick={handleCloseSettings}>
                Close
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Logs Terminal (no MUI) */}
      <Terminal
        isOpen={isLogsOpen}
        onClose={handleCloseLogs}
        title="Pipeline Logs"
        terminalLogs={terminalLogs}
        proplesLogs={proplesLogs}
        
      />
    </>
  )
}
