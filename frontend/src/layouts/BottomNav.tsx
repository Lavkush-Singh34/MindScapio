import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  BookOpen,
  ClipboardList,
  BarChart3,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const BottomNav: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Notes", path: "/notes", icon: BookOpen },
    { label: "Homework", path: "/homework", icon: ClipboardList },
    { label: "Tests", path: "/tests", icon: BarChart3 },
    { label: "Profile", path: "/profile", icon: MessageCircle },
  ];

  return (
    <nav className="sticky bottom-0 border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-around px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 px-2 flex-1 transition-colors ${
                isActive
                  ? "text-primary-600 dark:text-primary-400"
                  : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
              }`
            }
          >
            <item.icon size={24} />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
