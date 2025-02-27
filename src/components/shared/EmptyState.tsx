import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { ReactNode } from "react"

interface EmptyStateProps {
  title: string
  description: string
  Icon: LucideIcon
  action?: ReactNode
}

export function EmptyState({ title, description, Icon, action }: EmptyStateProps) {
  return (
    <div className="min-h-screen w-full flex items-start justify-center p-4 pt-16">
      <Card className="max-w-md w-full p-6 sm:p-8 mt-8 sm:mt-16">
        <div className="flex flex-col items-center space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <Icon className="w-8 h-8 text-gray-900" />
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>
          {action && <div className="mt-4">{action}</div>}
        </div>
      </Card>
    </div>
  )
}