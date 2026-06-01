import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useUIStore } from '@/store';
import '../styles/globals.css';

export default function DashboardLayout() {
  const { sidebarCollapsed, mobileMenuOpen, closeMobileMenu } = useUIStore();
  const [isMobile, setIsMobile] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar collapsed={sidebarCollapsed} />}

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={closeMobileMenu}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-50 lg:hidden"
            >
              <Sidebar collapsed={false} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-[280px]'}`}>
        <Header />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}