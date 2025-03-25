import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer } from "recharts"
import { ChevronDown, Maximize2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div role="alert" className="flex flex-col items-center justify-center h-full p-4 bg-destructive/10 rounded-md text-destructive">
    <p className="font-medium mb-2">Something went wrong:</p>
    <pre className="text-xs p-2 bg-background/50 rounded border border-destructive/20 max-w-full overflow-auto">{error.message}</pre>
  </div>
)

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, children, className }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const handleDownload = () => {
    console.log(`Downloading ${title} data`);
    // Implement actual download logic here
  };
  
  const handleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className={cn(
      "col-span-1 transition-all duration-300 hover:shadow-md",
      "border-muted/70 bg-card/90",
      "backdrop-blur-sm",
      isExpanded ? "scale-[1.02]" : "",
      className
    )}>
      <CardHeader className="flex flex-row justify-between items-center p-3 pb-0">
        <CardTitle className="text-sm font-medium text-foreground/80 flex items-center">
          <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
          {title}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 rounded-full hover:bg-muted/80"
            onClick={handleExpand}
          >
            <Maximize2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-muted/80">
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={handleDownload} className="text-xs cursor-pointer">
                <Download className="h-3.5 w-3.5 mr-2" />
                Download Data
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs cursor-pointer">
                Refresh
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs cursor-pointer">
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-3">
        <div className="p-2 bg-card rounded-md border border-border/30">
          <ResponsiveContainer 
            width="100%" 
            height={280} 
            aria-label={title}
            className="mt-2"
          >
            {React.isValidElement(children) ? children : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No data available
              </div>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

