import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  BookOpen,
  ClipboardList,
  Megaphone,
  BarChart3,
  MessageCircle,
  Calendar,
  Settings,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "../hooks/useNavigation";
import { motion } from "framer-motion";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { isMobile } = useNavigation();

  const studentNav = [
    { label: "Dashboard", path: "/", icon: Home },
    { label: "Notes", path: "/notes", icon: BookOpen },
    { label: "Homework", path: "/homework", icon: ClipboardList },
    { label: "Announcements", path: "/announcements", icon: Megaphone },
    { label: "Tests", path: "/tests", icon: BarChart3 },
    { label: "Progress", path: "/progress", icon: BarChart3 },
    { label: "Doubts", path: "/doubts", icon: MessageCircle },
    { label: "Schedule", path: "/schedule", icon: Calendar },
  ];

  const teacherNav = [
    { label: "Dashboard", path: "/", icon: Home },
    { label: "Manage Notes", path: "/admin/notes", icon: BookOpen },
    { label: "Manage Homework", path: "/admin/homework", icon: ClipboardList },
    { label: "Announcements", path: "/admin/announcements", icon: Megaphone },
    { label: "Manage Tests", path: "/admin/tests", icon: BarChart3 },
    { label: "Doubts", path: "/admin/doubts", icon: MessageCircle },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  const navItems = user?.role === "student" ? studentNav : teacherNav;

  const sidebarVariants = {
    hidden: { x: -280, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { x: -280, opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-64 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          {/* Logo */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-display font-bold">
                M
              </div>
              <div>
                <h1 className="font-display text-lg font-bold text-primary-600 dark:text-primary-400">
                  MindScapio
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {user?.role === "student" ? "Student" : "Teacher"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                      : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <motion.aside
          variants={sidebarVariants}
          initial="hidden"
          animate={isOpen ? "visible" : "hidden"}
          exit="exit"
          className="fixed left-0 top-0 z-40 h-full w-64 border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          {/* Close Button */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="font-display font-bold text-primary-600 dark:text-primary-400">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-lg dark:hover:bg-neutral-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                      : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </motion.aside>
      )}
    </>
  );
};

export default Sidebar;
