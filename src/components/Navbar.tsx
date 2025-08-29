
import { useAuth } from "@/hooks/useAuth";
import { NavLink } from "react-router-dom";
import AuthButton from "./AuthButton";
import { motion } from "framer-motion";

const Navbar = () => {
  const { isAuthenticated, getUserInfo } = useAuth();
  const userInfo = getUserInfo();

  return (
    <motion.header 
      className="sticky top-0 z-50 glass-panel py-4 px-6 my-4 mx-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <nav className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <NavLink 
            to="/" 
            className="text-xl font-medium"
          >
            Bighammer AI
          </NavLink>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated && userInfo && (
            <div className="hidden md:block text-sm font-medium text-muted-foreground">
              Welcome, {userInfo.name || userInfo.username}
            </div>
          )}
          <AuthButton />
        </div>
      </nav>
    </motion.header>
  );
};

export default Navbar;
