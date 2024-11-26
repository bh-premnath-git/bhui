import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Network, GitBranch } from 'lucide-react';

const designerOptions = [
  {
    id: 2,
    icon: <Network className="w-6 h-6" />,
    title: "Build Data Pipeline",
    desc: "Transform and enrich data via UI driven approach. Combine multiple datasets and create enriched data sets.",
    buttonText: 'Build Pipeline',
    link: '/designers/build-datapipeline/',
    gradient: "from-blue-500/20 via-blue-300/20 to-purple-500/20"
  },
  {
    id: 3,
    icon: <GitBranch className="w-6 h-6" />,
    title: "Manage Flow",
    desc: "Manage pipeline flows in Airflow. Schedule flows using cron expressions.",
    buttonText: 'Manage Flow',
    link: '/designers/manage-flow',
    gradient: "from-emerald-500/20 via-emerald-300/20 to-blue-500/20"
  },
];

function Designers() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-xl mx-auto mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Data Pipeline Designer
        </h1>
        <p className="text-sm text-muted-foreground">
          Build and manage your data pipelines with our intuitive designer tools
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {designerOptions.map((option) => (
          <div
            key={option.id}
            className="group relative overflow-hidden rounded-lg border bg-white p-6 shadow-sm transition-all hover:shadow-md"
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br ${option.gradient}`} />

            {/* Content */}
            <div className="relative z-10">
              <div className="mb-4 inline-block rounded-lg bg-gray-100/80 p-3">
                {option.icon}
              </div>

              <h2 className="mb-2 text-lg font-semibold">{option.title}</h2>
              <p className="mb-4 text-sm text-muted-foreground">{option.desc}</p>

              <Link
                to={option.link}
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors group"
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

export default Designers;