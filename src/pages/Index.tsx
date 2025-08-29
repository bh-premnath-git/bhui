
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const { isAuthenticated, login } = useAuth();

  return (
    <div className="page-transition min-h-screen flex flex-col px-4 sm:px-6 lg:px-8">
      <main className="flex-1 flex flex-col items-center justify-center text-center max-w-3xl mx-auto py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-12"
        >
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="inline-block px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
              Bighammer AI application
            </span>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {isAuthenticated ? (
              <Button asChild size="lg" className="glass-button">
                <Link to="/dataops-hub">
                  Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button onClick={login} size="lg" className="glass-button">
                Sign in with Bighammer.ai
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Index;
