import { motion } from 'framer-motion';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  X,
  CheckCircle,
  XCircle,
  Eye,
  Filter
} from 'lucide-react';
import { bookingApi, dashboardApi } from '@/api/client';
import { formatCurrency, formatDate, formatDateTime, cn } from '@/lib/utils';
import { Card, Badge, Button, Skeleton, EmptyState } from '@/components/ui';

const statusFilters = [
  { value: 'all', label: 'All Status' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const paymentFilters = [
  { value: 'all', label: 'All Payments' },
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partial', label: 'Partial' }
];

const statusBadgeColors = {
  confirmed: 'success',
  in_progress: 'info',
  completed: 'completed',
  cancelled: 'rejected',
  pending: 'pending'
};

export default function Bookings() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['bookings', statusFilter, paymentFilter],
    queryFn: () => {
      const config = {};
      if (statusFilter !== 'all') config.status = statusFilter;
      if (paymentFilter !== 'all') config.payment_status = paymentFilter;
      return bookingApi.getAll(config).then(res => res.data);
    },
    staleTime: 0,
    refetchOnMount: true
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => bookingApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      setSelectedBooking(null);
    }
  });

  const cancelBookingMutation = useMutation({
    mutationFn: (id) => bookingApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      setSelectedBooking(null);
    }
  });

  const getBookingsData = () => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data?.bookings)) return data.data.bookings;
    if (Array.isArray(data.data?.data)) return data.data.data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };
  const bookings = getBookingsData().map(b => ({
    ...b,
    id: b._id,
    customer_name: b.inquiry_id?.customer_name || 'N/A',
    date: b.inquiry_id?.event_date || b.start_date,
    service_name: b.inquiry_id?.event_type || 'Service'
  }));

  const handleAcceptBooking = (id) => {
    updateStatusMutation.mutate({ id, status: 'confirmed' });
  };

  const handleCancelBooking = (id) => {
    cancelBookingMutation.mutate(id);
  };

  if (error) {
    return (
      <EmptyState
        icon={Calendar}
        title="Error loading bookings"
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
            Bookings
          </h1>
          <p className="text-text-secondary mt-1">
            Manage and track all your bookings
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-text-muted" />
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  statusFilter === filter.value
                    ? 'bg-accent-primary text-white'
                    : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {paymentFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setPaymentFilter(filter.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                paymentFilter === filter.value
                  ? 'bg-accent-secondary text-white'
                  : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Bookings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-0 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No bookings found"
              description={
                statusFilter !== 'all' || paymentFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Bookings will appear here when customers book your services'
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-semibold text-text-secondary">Booking</th>
                    <th className="text-left p-4 text-sm font-semibold text-text-secondary">Customer</th>
                    <th className="text-left p-4 text-sm font-semibold text-text-secondary">Date & Time</th>
                    <th className="text-left p-4 text-sm font-semibold text-text-secondary">Amount</th>
                    <th className="text-left p-4 text-sm font-semibold text-text-secondary">Status</th>
                    <th className="text-left p-4 text-sm font-semibold text-text-secondary">Payment</th>
                    <th className="text-right p-4 text-sm font-semibold text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/50 hover:bg-background-tertiary/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-text-primary">{booking.booking_ref || `#BK${booking.id}`}</p>
                            <p className="text-sm text-text-muted">{booking.service_name || 'Service'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-text-muted" />
                          <span className="text-text-primary">{booking.customer_name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-text-muted" />
                            <span className="text-text-primary">{formatDateTime(booking.date)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-text-primary">
                          {formatCurrency(booking.total_amount || booking.price || 0)}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={statusBadgeColors[booking.status] || 'default'}>
                          {booking.status?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={booking.payment_status === 'paid' ? 'success' : 'warning'}>
                          {booking.payment_status || 'unpaid'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {booking.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAcceptBooking(booking.id)}
                                className="text-green-400 hover:text-green-300"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelBooking(booking.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <div className="bg-background-secondary border border-border rounded-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-text-primary">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Booking Reference */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-background-tertiary/50">
                <span className="text-text-secondary">Booking ID</span>
                <span className="font-semibold text-text-primary">
                  {selectedBooking.booking_ref || `#BK${selectedBooking.id}`}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Status</span>
                <Badge variant={statusBadgeColors[selectedBooking.status] || 'default'}>
                  {selectedBooking.status?.replace('_', ' ')}
                </Badge>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-text-secondary">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-background-tertiary/30">
                    <User className="w-4 h-4 text-text-muted" />
                    <span className="text-text-primary">{selectedBooking.customer_name}</span>
                  </div>
                  {selectedBooking.customer_email && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background-tertiary/30">
                      <Mail className="w-4 h-4 text-text-muted" />
                      <span className="text-text-primary">{selectedBooking.customer_email}</span>
                    </div>
                  )}
                  {selectedBooking.customer_phone && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background-tertiary/30">
                      <Phone className="w-4 h-4 text-text-muted" />
                      <span className="text-text-primary">{selectedBooking.customer_phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-text-secondary">Service Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary/30">
                    <span className="text-text-secondary">Service</span>
                    <span className="text-text-primary">{selectedBooking.service_name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary/30">
                    <span className="text-text-secondary">Date & Time</span>
                    <span className="text-text-primary">{formatDateTime(selectedBooking.date)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary/30">
                    <span className="text-text-secondary">Duration</span>
                    <span className="text-text-primary">{selectedBooking.duration_minutes || 'N/A'} mins</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-text-secondary">Payment Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary/30">
                    <span className="text-text-secondary">Total Amount</span>
                    <span className="text-lg font-bold text-text-primary">
                      {formatCurrency(selectedBooking.total_amount || selectedBooking.price || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background-tertiary/30">
                    <span className="text-text-secondary">Payment Status</span>
                    <Badge variant={selectedBooking.payment_status === 'paid' ? 'success' : 'warning'}>
                      {selectedBooking.payment_status || 'unpaid'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-text-secondary">Notes</h3>
                  <p className="text-text-primary p-3 rounded-xl bg-background-tertiary/30">
                    {selectedBooking.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                {selectedBooking.status === 'pending' && (
                  <>
                    <Button
                      variant="primary"
                      className="flex-1"
                      onClick={() => handleAcceptBooking(selectedBooking.id)}
                      isLoading={updateStatusMutation.isPending}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Booking
                    </Button>
                    <Button
                      variant="danger"
                      className="flex-1"
                      onClick={() => handleCancelBooking(selectedBooking.id)}
                      isLoading={cancelBookingMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
                {selectedBooking.status === 'confirmed' && (
                  <Button
                    variant="primary"
                    className="flex-1"
                    onClick={() => {
                      updateStatusMutation.mutate({ id: selectedBooking.id, status: 'completed' });
                    }}
                    isLoading={updateStatusMutation.isPending}
                  >
                    Mark as Completed
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}

// Dialog import helper
function Dialog({ open, onOpenChange, children }) {
  const { AnimatePresence, motion } = require('framer-motion');
  if (!open) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}