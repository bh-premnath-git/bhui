import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { ZoomIn, ZoomOut, Maximize, X } from "lucide-react"

export function FooterComponent() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-2 flex items-center justify-end">
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" aria-label="Preview fit">
            <Maximize className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" aria-label="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" aria-label="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-border mx-2" /> {/* Separator */}
          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm">Data Preview</Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="p-4 bg-background">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Data Preview</h2>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
                <p>This is where you would display your data preview content.</p>
                {/* Add more content for your data preview here */}
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </footer>
    </>
  )
}