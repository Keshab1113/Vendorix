import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Users,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { dashboardApi, inquiryApi } from '@/api/client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, Badge, Skeleton, EmptyState } from '@/components/ui';

const stats = [
  { key: 'total_bookings', label: 'Total Bookings', icon: Calendar, color: 'blue' },
  { key: 'total_revenue', label: 'Total Revenue', icon: DollarSign, color: 'green' },
  { key: 'pending_inquiries', label: 'Pending Inquiries', icon: MessageSquare, color: 'yellow' },
  { key: 'average_rating', label: 'Average Rating', icon: Star, color: 'purple' }
];

const statusColors = {
  pending: '#f59e0b',
  contacted: '#3b82f6',
  confirmed: '#10b981',
  rejected: '#ef4444',
  completed: '#8b5cf6'
};

export default function Dashboard() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: dashboardApi.getAnalytics
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['dashboard-revenue'],
    queryFn: dashboardApi.getRevenue
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: dashboardApi.getRecentActivity
  });

  const stats = statsData?.data?.data || {};
  const analytics = analyticsData?.data?.data || {};
  const revenue = revenueData?.data?.data || {};
  const activity = activityData?.data?.data || [];

  const monthlyRevenue = revenue.daily_revenue?.map((item) => ({
    date: formatDate(item.date, { month: 'short', day: 'numeric' }),
    revenue: item.revenue
  })) || [];

  const pieData = analytics.inquiry_by_status
    ? Object.entries(analytics.inquiry_by_status).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: statusColors[status]
      }))
    : [];

  const StatCard = ({ stat, index }) => {
    const Icon = stat.icon;
    const value = stats[stat.key];
    const formattedValue = stat.key === 'total_revenue'
      ? formatCurrency(value || 0)
      : stat.key === 'average_rating'
      ? Number(value || 0).toFixed(1)
      : value || 0;

    const colorMap = {
      blue: 'text-blue-400 bg-blue-400/10',
      green: 'text-green-400 bg-green-400/10',
      yellow: 'text-yellow-400 bg-yellow-400/10',
      purple: 'text-purple-400 bg-purple-400/10',
      cyan: 'text-cyan-400 bg-cyan-400/10'
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card hover className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-text-primary">{formattedValue}</h3>
            </div>
            <div className={`p-3 rounded-xl ${colorMap[stat.color]}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>

          {/* Mini chart placeholder */}
          <div className="mt-4 h-12 flex items-end gap-1">
            {[40, 65, 45, 80, 55, 70, 60].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-background-tertiary rounded-sm"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </Card>
      </motion.div>
    );
  };

  const loadingStats = [
    { key: 'total_bookings', label: 'Total Bookings', icon: Calendar, color: 'blue' },
    { key: 'total_revenue', label: 'Total Revenue', icon: DollarSign, color: 'green' },
    { key: 'pending_inquiries', label: 'Pending Inquiries', icon: MessageSquare, color: 'yellow' },
    { key: 'average_rating', label: 'Average Rating', icon: Star, color: 'purple' }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary">
            Dashboard
          </h1>
          <p className="text-text-secondary mt-1">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsLoading
          ? Array(4).fill(0).map((_, i) => (
              <Card key={i} className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-12 w-full" />
              </Card>
            ))
          : loadingStats.map((stat, i) => (
              <StatCard key={stat.key} stat={stat} index={i} />
            ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Revenue Overview</h3>
                <p className="text-sm text-text-secondary">Monthly revenue tracking</p>
              </div>
              <div className="flex items-center gap-2">
                {revenue.growth_percent !== undefined && (
                  <span className={`flex items-center gap-1 text-sm font-medium ${
                    revenue.growth_percent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {revenue.growth_percent >= 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {Math.abs(revenue.growth_percent)}%
                  </span>
                )}
              </div>
            </div>

            {revenueLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-xl" />
              </div>
            ) : monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                  <XAxis
                    dataKey="date"
                    stroke="#606070"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#606070"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111118',
                      border: '1px solid #2a2a3a',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                    }}
                    labelStyle={{ color: '#f8f8fc' }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={DollarSign}
                title="No revenue data"
                description="Revenue data will appear once you start receiving bookings"
              />
            )}
          </Card>
        </motion.div>

        {/* Inquiry Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="h-full">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Inquiry Status</h3>
              <p className="text-sm text-text-secondary">Distribution by status</p>
            </div>

            {analyticsLoading ? (
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-48 w-48 rounded-full" />
              </div>
            ) : pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111118',
                        border: '1px solid #2a2a3a',
                        borderRadius: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-4">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-text-secondary">
                        {item.name} ({item.value})
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="No inquiry data"
                description="Inquiry status distribution will appear here"
              />
            )}
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Recent Activity</h3>
                <p className="text-sm text-text-secondary">Latest updates from your business</p>
              </div>
            </div>

            {activityLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity.length > 0 ? (
              <div className="space-y-4">
                {activity.slice(0, 6).map((item, index) => (
                  <div
                    key={`${item.type}-${item.id}-${index}`}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-background-tertiary/50 transition-colors"
                  >
                    <div className={`p-2.5 rounded-xl ${
                      item.type === 'inquiry' ? 'bg-blue-400/10 text-blue-400' :
                      item.type === 'booking' ? 'bg-green-400/10 text-green-400' :
                      'bg-purple-400/10 text-purple-400'
                    }`}>
                      {item.type === 'inquiry' ? <MessageSquare className="w-4 h-4" /> :
                       item.type === 'booking' ? <Calendar className="w-4 h-4" /> :
                       <Star className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {item.customer_name || item.title || item.booking_ref}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {item.type === 'inquiry' ? item.event_type : item.status}
                      </p>
                    </div>
                    <Badge variant={item.status || 'default'} className="text-xs">
                      {item.status || item.type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Clock}
                title="No recent activity"
                description="Recent activity will appear here"
              />
            )}
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Monthly Summary</h3>
              <p className="text-sm text-text-secondary">This month's performance</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-green-400/10 text-green-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">This Month</p>
                    <p className="text-xl font-bold text-text-primary">
                      {formatCurrency(revenue.this_month || 0)}
                    </p>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-400/10 text-blue-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Upcoming Bookings</p>
                    <p className="text-xl font-bold text-text-primary">
                      {stats.upcoming_bookings || 0}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-blue-400" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-400/10 text-purple-400">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Conversion Rate</p>
                    <p className="text-xl font-bold text-text-primary">
                      {stats.total_inquiries > 0
                        ? ((stats.total_bookings / stats.total_inquiries) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary/50">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-yellow-400/10 text-yellow-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Average Budget</p>
                    <p className="text-xl font-bold text-text-primary">
                      {formatCurrency(analytics.average_budget || 0)}
                    </p>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}