import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, Moon, Sun, LogOut, User, Settings } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useUIStore, useAuthStore, useToastStore } from '@/store';
import { notificationApi } from '@/api/client';
import { Avatar, Badge } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';

export default function Header() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mobileMenuOpen, toggleMobileMenu } = useUIStore();
  const { user, vendor, logout } = useAuthStore();
  const toast = useToastStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch notifications
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await notificationApi.getAll({ unread_only: 'false' });
      return response.data.data;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('All notifications marked as read');
    }
  });

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/inquiries?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unread_count || 0;

  return (
    <header className="sticky top-0 z-20 h-16 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="h-full flex items-center justify-between px-4 md:px-6">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-lg hover:bg-background-tertiary transition-colors text-text-muted hover:text-text-primary"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search inquiries, bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 lg:w-80 pl-10 pr-4 py-2 bg-background-secondary border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
              />
            </div>
          </form>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-background-tertiary transition-colors text-text-muted hover:text-text-primary">
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-background-tertiary transition-colors text-text-muted hover:text-text-primary"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-accent-blue rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-background-secondary border border-border rounded-2xl shadow-xl overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllReadMutation.mutate()}
                        className="text-xs text-accent-blue hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 md:max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-text-muted">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications yet</p>
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            'p-4 border-b border-border/50 hover:bg-background-tertiary/50 transition-colors cursor-pointer',
                            !notif.is_read && 'bg-accent-blue/5'
                          )}
                          onClick={() => {
                            if (!notif.is_read) {
                              markAsReadMutation.mutate(notif.id);
                            }
                            if (notif.link) {
                              navigate(notif.link);
                              setShowNotifications(false);
                            }
                          }}
                        >
                          <div className="flex gap-3">
                            <div className={cn(
                              'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                              !notif.is_read ? 'bg-accent-blue' : 'bg-transparent'
                            )} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-text-primary">{notif.title}</p>
                              <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{notif.message}</p>
                              <p className="text-xs text-text-muted mt-1">{formatRelativeTime(notif.created_at)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-border">
                      <button
                        onClick={() => {
                          navigate('/notifications');
                          setShowNotifications(false);
                        }}
                        className="w-full text-center text-sm text-accent-blue hover:underline"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-background-tertiary transition-colors"
            >
              <Avatar
                src={vendor?.profile_image}
                fallback={user?.email?.[0]?.toUpperCase() || 'U'}
                size="sm"
              />
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 bg-background-secondary border border-border rounded-2xl shadow-xl overflow-hidden"
                >
                  <div className="p-4 border-b border-border">
                    <p className="font-medium text-text-primary truncate">
                      {vendor?.business_name || user?.email?.split('@')[0]}
                    </p>
                    <p className="text-sm text-text-muted truncate">{user?.email}</p>
                  </div>

                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowProfile(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-tertiary transition-colors text-text-secondary hover:text-text-primary"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-background-tertiary transition-colors text-red-400 hover:text-red-300"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}