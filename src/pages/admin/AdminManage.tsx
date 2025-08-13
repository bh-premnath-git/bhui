
import { Users, FolderGit2, Settings2, ArrowRight, Cable, BookMarked, ShieldCheck, BotIcon, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ROUTES } from '@/config/routes';
import { withPageErrorBoundary} from '@/components/withPageErrorBoundary';

const adminOptions = [
  {
    id: 1,
    icon: <Users className="w-6 h-6 text-foreground" />,
    title: "Manage Users",
    desc: "Manage internal users, roles, and permissions for the platform.",
    buttonText: 'Manage Users',
    link: ROUTES.ADMIN.USERS.INDEX.toString(),
    gradient: "from-blue-500/20 via-blue-300/20 to-purple-500/20"
  },
  {
    id: 2,
    icon: <FolderGit2 className="w-6 h-6 text-foreground" />,
    title: "Manage Projects",
    desc: "Create and manage projects, repositories, and project settings.",
    buttonText: 'Manage Projects',
    link: ROUTES.ADMIN.PROJECTS.INDEX.toString(),
    gradient: "from-emerald-500/20 via-emerald-300/20 to-blue-500/20"
  },
  {
    id: 3,
    icon: <Settings2 className="w-6 h-6 text-foreground" />,
    title: "Manage Environments",
    desc: "Configure and manage development, staging, and production environments.",
    buttonText: 'Manage Environments',
    link: ROUTES.ADMIN.ENVIRONMENT.INDEX.toString(),
    gradient: "from-amber-500/20 via-amber-300/20 to-yellow-500/20"
  },
  {
    id: 4,
    icon: <Cable className="w-6 h-6 text-foreground" />,
    title: "Manage Connection",
    desc: "Establish your database connection to improvise your data",
    buttonText: 'Manage Connection',
    link: ROUTES.ADMIN.CONNECTION.INDEX.toString(),
    gradient: "from-red-500/20 via-orange-300/20 to-pink-500/20"
  },
  {
    id: 5,
    icon: <BookMarked className="w-6 h-6 text-foreground" />,
    title: "Manage Prompts",
    desc: "Refine the BH-AI-Agent prompts to optimize responses and enhance user interactions.",
    buttonText: 'Manage Prompt',
    link: ROUTES.ADMIN.PROMPT.INDEX.toString(),
    gradient: "from-purple-500/20 via-violet-300/20 to-indigo-500/20"
  },
  {
    id: 6,
    icon: <ShieldCheck className="w-6 h-6 text-foreground" />,
    title: "Manage PII",
    desc: "Configure and manage Personal Identifiable Information (PII) recognizers and patterns.",
    buttonText: 'Manage PII',
    link: ROUTES.ADMIN.PII.INDEX.toString(),
    gradient: "from-cyan-500/20 via-teal-300/20 to-blue-500/20"
  },
  {
  id: 7,
  icon: <Bot className="w-6 h-6 text-foreground" />,
  title: "Manage LLMs",
  desc: "Configure and manage Large Language Models (LLMs) for chat and embeddings.",
  buttonText: "Manage LLMs",
  link: ROUTES.ADMIN.LLM.INDEX.toString(),
  gradient: "from-indigo-500/20 via-purple-400/20 to-pink-500/20"
}

];

function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-xl mx-auto mb-8 text-center">
        <p className="text-sm text-muted-foreground">
          Manage platform Users, Projects, and Environments
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {adminOptions.map((option) => (
          <div key={option.id} className="group relative">
            <Card className="relative overflow-hidden border-border bg-background shadow-sm transition-all hover:shadow-md">
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${option.gradient}`} />
              <CardHeader className="relative z-10">
                <div className="mb-4 inline-block rounded-lg bg-muted p-6">
                  {option.icon}
                </div>
                <CardTitle className="mb-2 text-lg">
                  {option.title}
                </CardTitle>
                <CardDescription className="mb-4">
                  {option.desc}
                </CardDescription>
                <button className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
                onClick={() => navigate(option.link)}
                >
                  {option.buttonText}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </CardHeader>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withPageErrorBoundary(AdminDashboard, 'AdminDashboard');
