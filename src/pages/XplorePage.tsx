import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import Dashboard from '@/components/Xplore/Dashboard'

const XplorePage = () => {
  return (
    <AnalyticsProvider>
      <Dashboard />
    </AnalyticsProvider>)
}

export default XplorePage