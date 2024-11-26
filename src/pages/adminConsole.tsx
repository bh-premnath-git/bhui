import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, FolderGit2, Network, ArrowRight } from 'lucide-react';

const adminOptions = [
  {
    id: 1,
    icon: <Users className="w-6 h-6" />,
    title: "Manage Users",
    desc: "Manage internal users, roles, and permissions for the platform.",
    buttonText: 'Manage Users',
    link: '/admin-console/users',
    gradient: "from-blue-500/20 via-blue-300/20 to-purple-500/20"
  },
  {
    id: 2,
    icon: <Building2 className="w-6 h-6" />,
    title: "Manage Customers",
    desc: "Manage customer accounts, subscriptions, and access controls.",
    buttonText: 'Manage Customers',
    link: '/admin-console/customers',
    gradient: "from-purple-500/20 via-purple-300/20 to-pink-500/20"
  },
  {
    id: 3,
    icon: <FolderGit2 className="w-6 h-6" />,
    title: "Manage Projects",
    desc: "Create and manage projects, repositories, and project settings.",
    buttonText: 'Manage Projects',
    link: '/admin-console/projects',
    gradient: "from-emerald-500/20 via-emerald-300/20 to-blue-500/20"
  },
  {
    id: 4,
    icon: <Network className="w-6 h-6" />,
    title: "Manage Environments",
    desc: "Configure and manage development, staging, and production environments.",
    buttonText: 'Manage Environments',
    link: '/admin-console/environment',
    gradient: "from-amber-500/20 via-amber-300/20 to-yellow-500/20"
  },
];

const AdminConsole = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-xl mx-auto mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Admin Console
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your platform settings, users, and resources
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {adminOptions.map((option) => (
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
};

export default AdminConsole;