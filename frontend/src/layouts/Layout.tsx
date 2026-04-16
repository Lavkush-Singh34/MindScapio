import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigation } from "../hooks/useNavigation";
import TopNav from "./TopNav";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import "../styles/layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isMobile } = useNavigation();

  return (
    <div className="flex h-screen bg-gradient-mesh">
      {/* Sidebar - Desktop Only */}
      {!isMobile && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Overlay - Mobile */}
      {isMobile && sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile Drawer */}
      {isMobile && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNav onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>

        {/* Bottom Navigation - Mobile Only */}
        {isMobile && <BottomNav />}
      </div>
    </div>
  );
};

export default Layout;
