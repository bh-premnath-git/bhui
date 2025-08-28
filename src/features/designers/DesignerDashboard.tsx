
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { ArrowRight, Network, GitBranch, NotebookText } from 'lucide-react';

const designerOptions = [
  {
    id: 2,
    icon: <Network className="w-6 h-6 text-foreground" />,
    title: "Data Pipeline",
    desc: "Transform and enrich data via UI driven approach. Combine multiple datasets and create enriched data sets.",
    buttonText: 'Build Pipeline',
    link: ROUTES.DESIGNERS.BUILD_PLAYGROUND(null),
    gradient: "from-blue-500/20 via-blue-300/20 to-purple-500/20"
  },
  {
    id: 3,
    icon: <GitBranch className="w-6 h-6 text-foreground" />,
    title: "Data Flow",
    desc: "Manage pipeline flows in Airflow. Schedule flows using cron expressions.",
    buttonText: 'Build Flow',
    link: ROUTES.DESIGNERS.Data_FLOW_PLAYGROUND(null),
    gradient: "from-emerald-500/20 via-emerald-300/20 to-blue-500/20"
  },
  {
    id: 4,
    icon: <NotebookText className="w-6 h-6 text-foreground" />,
    title: "Notebooks",
    desc: "Create interactive notebooks to analyze data, develop algorithms and document your data science workflows.",
    buttonText: 'Open Notebook',
    link: ROUTES.DESIGNERS.NOTEBOOK,
    gradient: "from-purple-500/20 via-pink-300/20 to-rose-500/20"
  },
];

export function Designers() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Page Title */}
      <div className="max-w-xl mx-auto mb-8 text-center">
        <p className="text-sm text-muted-foreground">
          Build and manage your data pipelines with our intuitive designer tools
        </p>
      </div>

      {/* Card Grid */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {designerOptions.map((option) => (
          <div
            key={option.id}
            className="group relative overflow-hidden rounded-lg border border-border bg-background p-6 shadow-sm transition-all hover:shadow-md"
          >
            {/* Background Gradient on Hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${option.gradient}`} />

            <div className="relative z-10">
              {/* Icon Wrapper */}
              <div className="mb-4 inline-block rounded-lg bg-muted p-3">
                {option.icon}
              </div>

              {/* Title & Description */}
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                {option.title}
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">{option.desc}</p>

              {/* Button Link */}
              <Link
                to={option.link}
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
              >
                {option.buttonText}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

