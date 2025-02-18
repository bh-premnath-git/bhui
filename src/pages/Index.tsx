import { withPageErrorBoundary } from '@/components/PageErrorBoundary';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function Index() {
  return (
    <div className="min-h-screen p-8 bg-background text-foreground">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">
            Here's an overview of your dashboard
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
              <CardDescription>Active users in your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">1,234</p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Monthly revenue overview</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$12,345</p>
            </CardContent>
          </Card>

          <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Currently running projects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">23</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted"
                >
                  <div className="space-y-1">
                    <p className="font-medium">Activity {item}</p>
                    <p className="text-sm text-muted-foreground">
                      Description of activity {item}
                    </p>
                  </div>
                  <Button variant="outline">View</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default withPageErrorBoundary(Index, 'Index');
