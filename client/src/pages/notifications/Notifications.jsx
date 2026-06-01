import { motion } from 'framer-motion';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Mail,
  Calendar,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { notificationApi } from '@/api/client';
import { formatRelativeTime, cn } from '@/lib/utils';
import { Card, Badge, Button, Skeleton, EmptyState } from '@/components/ui';
import { useToast } from '@/components/ui';

const notificationIcons = {
  inquiry: MessageSquare,
  booking: Calendar,
  system: Bell,
  default: Mail
};

const notificationColors = {
  inquiry: 'bg-blue-400/10 text-blue-400',
  booking: 'bg-green-400/10 text-green-400',
  system: 'bg-purple-400/10 text-purple-400',
  default: 'bg-gray-400/10 text-gray-400'
};

export default function Notifications() {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: async () => {
      const response = await notificationApi.getAll({
        unread_only: filter === 'unread' ? 'true' : filter === 'read' ? 'false' : undefined
      });
      return response.data;
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      showToast('Success', 'Notification marked as read', 'success');
    },
    onError: (error) => {
      showToast('Error', error.message || 'Failed to mark as read', 'error');
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      showToast('Success', 'All notifications marked as read', 'success');
    },
    onError: (error) => {
      showToast('Error', error.message || 'Failed to mark all as read', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      showToast('Success', 'Notification deleted', 'success');
    },
    onError: (error) => {
      showToast('Error', error.message || 'Failed to delete notification', 'error');
    }
  });

  const getNotificationsData = () => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data?.notifications)) return data.data.notifications;
    if (Array.isArray(data.data?.data)) return data.data.data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };
  const notifications = getNotificationsData().map(n => ({ ...n, id: n._id }));
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = (id) => {
    markAsReadMutation.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      deleteMutation.mutate(id);
    }
  };

  const getIcon = (type) => {
    return notificationIcons[type] || notificationIcons.default;
  };

  if (error) {
    return (
      <EmptyState
        icon={Bell}
        title="Error loading notifications"
        description={error.message || 'Something went wrong'}
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary">
            Notifications
          </h1>
          <p className="text-text-secondary mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={handleMarkAllAsRead} isLoading={markAllAsReadMutation.isPending}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-x-auto pb-2"
      >
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filter === 'all'
                ? 'bg-accent-primary text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filter === 'unread'
                ? 'bg-accent-primary text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            )}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('read')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              filter === 'read'
                ? 'bg-accent-primary text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            )}
          >
            Read
          </button>
        </div>
      </motion.div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <EmptyState
            icon={Bell}
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            description={filter === 'unread' ? 'You have read all your notifications' : 'Notifications will appear here'}
          />
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {notifications.map((notification, index) => {
            const Icon = getIcon(notification.type);
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card
                  hover={!notification.is_read}
                  className={cn(
                    'flex items-start gap-4 transition-all',
                    !notification.is_read && 'border-l-4 border-l-accent-primary'
                  )}
                >
                  <div className={cn('p-3 rounded-xl flex-shrink-0', notificationColors[notification.type])}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className={cn(
                          'font-medium truncate',
                          notification.is_read ? 'text-text-secondary' : 'text-text-primary'
                        )}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-text-muted mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-text-muted mt-2">
                          {formatRelativeTime(notification.created_at || notification.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.is_read && (
                          <Badge variant="info" className="text-xs">New</Badge>
                        )}
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-text-muted" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>

                    {notification.action_url && (
                      <a
                        href={notification.action_url}
                        className="inline-flex items-center gap-1 mt-3 text-sm text-accent-primary hover:underline"
                      >
                        View Details
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}