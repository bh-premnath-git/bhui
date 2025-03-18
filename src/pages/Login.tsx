import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {  Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const { isAuthenticated, isInitialized, login } = useAuth();
  const navigate = useNavigate();
  const [loginAttempted, setLoginAttempted] = useState(false);
  
  // Always redirect to dashboard when authenticated
  const from = "/dataops-hub";
  
  // Effect to redirect to dashboard when authenticated
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isInitialized, from, navigate]);
  
  // Handle login button click
  const handleLogin = async () => {
    setLoginAttempted(true);
    try {
      await login();
    } catch (error) {
      console.error("Login attempt failed:", error);
      setLoginAttempted(false);
    }
  };
  
  // Show loading state while Keycloak initializes
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don't show login page if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dataops-hub" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel p-8 max-w-md w-full text-center"
      >
        <h1 className="text-2xl font-bold mb-6">Authentication Required</h1>
        <p className="text-muted-foreground mb-8">
          Please log in to access this application
        </p>
        
        <Button 
          onClick={handleLogin} 
          size="lg" 
          className="glass-button w-full"
          disabled={loginAttempted}
        >
          {loginAttempted ? (
            <>
              <div className="w-4 h-4 border-t-2 border-b-2 border-current rounded-full animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="mr-2 h-4 w-4" />
              Sign in with Bighammer
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default Login;
