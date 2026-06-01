import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Package,
  Briefcase,
  Image,
  BarChart3,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore, useAuthStore } from '@/store';
import { Avatar } from '@/components/ui';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inquiries', icon: MessageSquare, label: 'Inquiries' },
  { to: '/bookings', icon: Calendar, label: 'Bookings' },
  { to: '/services', icon: Briefcase, label: 'Services' },
  { to: '/packages', icon: Package, label: 'Packages' },
  { to: '/gallery', icon: Image, label: 'Gallery' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/settings', icon: Settings, label: 'Settings' }
];

export default function Sidebar({ collapsed }) {
  const location = useLocation();
  const { setSidebarCollapsed, closeMobileMenu } = useUIStore();
  const { user, vendor, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 bottom-0 bg-background-secondary border-r border-border flex flex-col z-30 transition-all duration-300',
      collapsed ? 'w-[72px]' : 'w-[280px]'
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-border',
        collapsed ? 'justify-center' : 'justify-between'
      )}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-heading font-bold text-xl gradient-text"
            >
              Vendorix
            </motion.span>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setSidebarCollapsed(true)}
            className="p-2 rounded-lg hover:bg-background-tertiary transition-colors text-text-muted hover:text-text-primary"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={closeMobileMenu}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
              isActive
                ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary',
              collapsed && 'justify-center'
            )}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span className="font-medium">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse button for collapsed state */}
      {collapsed && (
        <div className="p-3 border-t border-border">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="w-full p-2.5 rounded-xl bg-background-tertiary hover:bg-background-tertiary/80 transition-colors flex items-center justify-center text-text-muted hover:text-text-primary"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* User Profile */}
      <div className={cn(
        'p-4 border-t border-border',
        collapsed && 'flex justify-center'
      )}>
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <Avatar
              src={vendor?.profile_image}
              fallback={user?.email?.[0]?.toUpperCase() || 'U'}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-text-primary truncate">
                {vendor?.business_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-sm text-text-muted truncate">
                {vendor?.category || 'Vendor'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-background-tertiary transition-colors text-text-muted hover:text-red-400"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl hover:bg-background-tertiary transition-colors text-text-muted hover:text-red-400"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
}