import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Database, Settings, BarChart3, Users } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Data Catalog',
      description: 'Browse and manage your data sources',
      icon: Database,
      path: ROUTES.DATA_CATALOG,
      color: 'text-blue-600'
    },
    {
      title: 'DataOps Hub',
      description: 'Monitor and manage data operations',
      icon: BarChart3,
      path: ROUTES.DATAOPS.INDEX,
      color: 'text-green-600'
    },
    {
      title: 'Designers',
      description: 'Build and manage data pipelines',
      icon: Settings,
      path: ROUTES.DESIGNERS.INDEX,
      color: 'text-purple-600'
    },
    {
      title: 'Admin Console',
      description: 'Manage users and system settings',
      icon: Users,
      path: ROUTES.ADMIN.INDEX,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Welcome Home</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your central hub for data management, analytics, and operations. Choose where you'd like to go.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card 
              key={action.title} 
              className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => navigate(action.path)}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Icon className={`h-12 w-12 ${action.color}`} />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(action.path);
                  }}
                >
                  Go to {action.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              New to the platform? Here are some quick tips to get you started.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-left space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">1</div>
              <p>Start by exploring the <strong>Data Catalog</strong> to understand your available data sources.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-semibold">2</div>
              <p>Use the <strong>Designers</strong> section to build and manage your data pipelines.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm font-semibold">3</div>
              <p>Monitor your operations in real-time through the <strong>DataOps Hub</strong>.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;
