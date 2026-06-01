import { motion } from 'framer-motion';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Download,
  Filter
} from 'lucide-react';
import { dashboardApi } from '@/api/client';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { Card, Badge, Button, Skeleton, EmptyState } from '@/components/ui';

const dateRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '12m', label: 'Last 12 months' }
];

const inquirySources = [
  { name: 'Website', value: 45, color: '#3b82f6' },
  { name: 'Referral', value: 30, color: '#10b981' },
  { name: 'Social Media', value: 15, color: '#8b5cf6' },
  { name: 'Direct', value: 10, color: '#f59e0b' }
];

const statusColors = {
  pending: '#f59e0b',
  contacted: '#3b82f6',
  confirmed: '#10b981',
  rejected: '#ef4444',
  completed: '#8b5cf6',
  cancelled: '#ef4444'
};

export default function Analytics() {
  const [dateRange, setDateRange] = useState('30d');

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics-stats', dateRange],
    queryFn: () => dashboardApi.getStats()
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics-data', dateRange],
    queryFn: () => dashboardApi.getAnalytics()
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['analytics-revenue', dateRange],
    queryFn: () => dashboardApi.getRevenue()
  });

  const stats = statsData?.data?.data || {};
  const analytics = analyticsData?.data?.data || {};
  const revenue = revenueData?.data?.data || {};

  // Transform data for charts
  const monthlyRevenue = revenue.monthly_revenue?.map((item) => ({
    month: formatDate(item.month, { month: 'short' }),
    revenue: item.revenue
  })) || [];

  const bookingsTrend = revenue.bookings_trend?.map((item) => ({
    date: formatDate(item.date, { month: 'short', day: 'numeric' }),
    bookings: item.bookings
  })) || [];

  const inquiryByStatus = analytics.inquiry_by_status
    ? Object.entries(analytics.inquiry_by_status).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: statusColors[status] || '#6b7280'
      }))
    : [];

  const handleExport = () => {
    // Placeholder for export functionality
    alert('Export functionality - coming soon');
  };

  const chartColors = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    grid: '#2a2a3a'
  };

  const tooltipStyle = {
    backgroundColor: '#111118',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
  };

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
            Analytics
          </h1>
          <p className="text-text-secondary mt-1">
            Track your business performance and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center gap-2 p-1 bg-background-secondary rounded-xl">
            {dateRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  dateRange === range.value
                    ? 'bg-accent-primary text-white'
                    : 'text-text-secondary hover:bg-background-tertiary'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
          <Button variant="secondary" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
              <Skeleton className="h-8 w-20" />
            </Card>
          ))
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card hover className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-text-primary">
                      {formatCurrency(stats.total_revenue || 0)}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-green-400/10 text-green-400">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
                {revenue.growth_percent !== undefined && (
                  <div className={cn(
                    'flex items-center gap-1 mt-2 text-sm',
                    revenue.growth_percent >= 0 ? 'text-green-400' : 'text-red-400'
                  )}>
                    {revenue.growth_percent >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span>{Math.abs(revenue.growth_percent)}% vs last period</span>
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card hover className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Total Bookings</p>
                    <h3 className="text-2xl font-bold text-text-primary">
                      {stats.total_bookings || 0}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-400/10 text-blue-400">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card hover className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Conversion Rate</p>
                    <h3 className="text-2xl font-bold text-text-primary">
                      {stats.total_inquiries > 0
                        ? ((stats.total_bookings / stats.total_inquiries) * 100).toFixed(1)
                        : 0}%
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-400/10 text-purple-400">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card hover className="relative overflow-hidden">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-text-secondary mb-1">Avg Booking Value</p>
                    <h3 className="text-2xl font-bold text-text-primary">
                      {formatCurrency(stats.average_booking_value || 0)}
                    </h3>
                  </div>
                  <div className="p-3 rounded-xl bg-yellow-400/10 text-yellow-400">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Month */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Revenue by Month</h3>
                <p className="text-sm text-text-secondary">Monthly revenue trend</p>
              </div>
            </div>

            {revenueLoading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis
                    dataKey="month"
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
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: '#f8f8fc' }}
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={chartColors.primary}
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={DollarSign}
                title="No revenue data"
                description="Revenue data will appear once you have bookings"
              />
            )}
          </Card>
        </motion.div>

        {/* Inquiry Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="h-full">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Inquiry Sources</h3>
              <p className="text-sm text-text-secondary">Where inquiries come from</p>
            </div>

            {analyticsLoading ? (
              <Skeleton className="h-48 w-48 rounded-full mx-auto" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={inquirySources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {inquirySources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [`${value}%`, 'Share']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-4">
                  {inquirySources.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-text-secondary">
                        {item.name} ({item.value}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Bookings Trend</h3>
                <p className="text-sm text-text-secondary">Bookings over time</p>
              </div>
            </div>

            {revenueLoading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : bookingsTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={bookingsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
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
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: '#f8f8fc' }}
                    formatter={(value) => [value, 'Bookings']}
                  />
                  <Bar
                    dataKey="bookings"
                    fill={chartColors.secondary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No bookings data"
                description="Bookings data will appear here"
              />
            )}
          </Card>
        </motion.div>

        {/* Inquiry Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="h-full">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Inquiry Status</h3>
              <p className="text-sm text-text-secondary">Distribution by status</p>
            </div>

            {analyticsLoading ? (
              <Skeleton className="h-64 w-full rounded-xl" />
            ) : inquiryByStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={inquiryByStatus} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis
                    type="number"
                    stroke="#606070"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#606070"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{ color: '#f8f8fc' }}
                    formatter={(value) => [value, 'Count']}
                  />
                  <Bar
                    dataKey="value"
                    radius={[0, 4, 4, 0]}
                  >
                    {inquiryByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                icon={Filter}
                title="No inquiry data"
                description="Inquiry status distribution will appear here"
              />
            )}
          </Card>
        </motion.div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Top Services</h3>
              <p className="text-sm text-text-secondary">Most booked services</p>
            </div>
            <div className="space-y-4">
              {(analytics.top_services || []).slice(0, 5).map((service, index) => (
                <div key={service.id || index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-primary/10 text-accent-primary flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <span className="text-text-primary">{service.name}</span>
                  </div>
                  <Badge>{service.bookings} bookings</Badge>
                </div>
              ))}
              {(!analytics.top_services || analytics.top_services.length === 0) && (
                <p className="text-text-muted text-sm text-center py-4">No data yet</p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Customer Retention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Customer Retention</h3>
              <p className="text-sm text-text-secondary">Repeat customers</p>
            </div>
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <div className="text-4xl font-bold text-accent-primary">
                  {analytics.retention_rate || 0}%
                </div>
                <p className="text-text-secondary mt-2">Return customers</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Average Budget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Average Budget</h3>
              <p className="text-sm text-text-secondary">Customer budget range</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary/50">
                <span className="text-text-secondary">Min Budget</span>
                <span className="font-semibold text-text-primary">
                  {formatCurrency(analytics.min_budget || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary/50">
                <span className="text-text-secondary">Avg Budget</span>
                <span className="font-semibold text-text-primary">
                  {formatCurrency(analytics.average_budget || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary/50">
                <span className="text-text-secondary">Max Budget</span>
                <span className="font-semibold text-text-primary">
                  {formatCurrency(analytics.max_budget || 0)}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}