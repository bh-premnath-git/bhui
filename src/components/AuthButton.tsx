
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

const AuthButton = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async () => {
    if (isAuthenticated) {
      await logout();
    } else {
      // Direct login will redirect to dashboard via the login implementation
      await login();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Button 
        onClick={handleAuth} 
        className="glass-button"
        variant="outline"
      >
        {isAuthenticated ? (
          <>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4 mr-2" />
            Login
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default AuthButton;
