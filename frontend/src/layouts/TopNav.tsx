import React from "react";
import { Menu, Bell, LogOut, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "../hooks/useNavigation";
import { motion } from "framer-motion";

interface TopNavProps {
  onMenuClick: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { isMobile } = useNavigation();

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/80"
    >
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 md:px-8">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {isMobile && (
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-neutral-100 rounded-lg dark:hover:bg-neutral-800"
            >
              <Menu size={24} />
            </button>
          )}
          <div>
            <h1 className="font-display text-lg font-bold text-primary-600 dark:text-primary-400">
              MindScapio
            </h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-neutral-100 rounded-lg dark:hover:bg-neutral-800 transition-colors">
            <Bell size={20} className="text-neutral-600 dark:text-neutral-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-3 pl-3 border-l border-neutral-200 dark:border-neutral-800">
            {user?.photo && (
              <img
                src={user.photo}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            {!user?.photo && (
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <User size={16} className="text-primary-600 dark:text-primary-400" />
              </div>
            )}
            {!isMobile && <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{user?.name}</span>}
            <button
              onClick={logout}
              className="p-2 hover:bg-neutral-100 rounded-lg dark:hover:bg-neutral-800 transition-colors"
              title="Logout"
            >
              <LogOut size={18} className="text-red-500" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default TopNav;
