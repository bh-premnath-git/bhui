import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer } from "recharts"
import React from "react"

export const ErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div role="alert" className="text-destructive">
    <p>Something went wrong:</p>
    <pre>{error.message}</pre>
  </div>
)

export const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <Card className="col-span-1">
    <CardHeader className="flex justify-center items-center">
      <CardTitle className="text-sm text-center">{title}</CardTitle>
    </CardHeader>
    <CardContent>
        <ResponsiveContainer width="100%" height={280} aria-label={title}>
          {React.isValidElement(children) ? children : <div>No data available</div>}
        </ResponsiveContainer>
    </CardContent>
  </Card>
)

