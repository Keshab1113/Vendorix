import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X,
  Inbox
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { inquiryApi } from '@/api/client';
import { useToastStore } from '@/store';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { Card, Badge, Button, Input, Skeleton, EmptyState, Dialog } from '@/components/ui';
import InquiryDetails from './InquiryDetails';

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' }
];

const priorityOptions = [
  { value: '', label: 'All Priority' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' }
];

export default function Inquiries() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToastStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');
  const [page, setPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch inquiries
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['inquiries', { page, search, status, priority }],
    queryFn: async () => {
      const response = await inquiryApi.getAll({
        page,
        limit: 10,
        search: search || undefined,
        status: status || undefined,
        priority: priority || undefined
      });
      return response.data.data;
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => inquiryApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['inquiries']);
      toast.success('Status updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const handleStatusUpdate = (id, newStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const inquiries = data?.inquiries || [];
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'contacted': return 'badge-contacted';
      case 'confirmed': return 'badge-confirmed';
      case 'rejected': return 'badge-rejected';
      case 'completed': return 'badge-completed';
      default: return '';
    }
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
            Inquiries
          </h1>
          <p className="text-text-secondary mt-1">
            Manage and respond to customer inquiries
          </p>
        </div>
      </motion.div>

      {/* Filters & Search */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search by name, email, or event type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background-tertiary border border-border rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-blue transition-colors"
              />
            </div>
          </form>

          {/* Quick Filters */}
          <div className="flex gap-2">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="px-4 py-2.5 bg-background-tertiary border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <select
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(1); }}
              className="px-4 py-2.5 bg-background-tertiary border border-border rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            >
              {priorityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'p-2.5 rounded-xl border transition-colors',
                showFilters ? 'bg-accent-blue/10 border-accent-blue/30 text-accent-blue' : 'border-border text-text-muted hover:text-text-primary'
              )}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Active filters */}
        {(status || priority || search) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue/10 text-accent-blue rounded-lg text-sm">
                Search: {search}
                <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {status && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-sm">
                Status: {status}
                <button onClick={() => setStatus('')}><X className="w-3 h-3" /></button>
              </span>
            )}
            {priority && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm">
                Priority: {priority}
                <button onClick={() => setPriority('')}><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Inquiries Table */}
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
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : inquiries.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No inquiries found"
            description={search || status || priority ? "Try adjusting your filters" : "New inquiries will appear here"}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-sm font-medium text-text-secondary">Customer</th>
                    <th className="text-left p-4 text-sm font-medium text-text-secondary">Event</th>
                    <th className="text-left p-4 text-sm font-medium text-text-secondary hidden md:table-cell">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-text-secondary hidden lg:table-cell">Budget</th>
                    <th className="text-left p-4 text-sm font-medium text-text-secondary">Status</th>
                    <th className="text-right p-4 text-sm font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry, index) => (
                    <motion.tr
                      key={inquiry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="table-row"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-text-primary">{inquiry.customer_name}</p>
                          <p className="text-sm text-text-muted">{inquiry.customer_email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-text-primary">{inquiry.event_type}</p>
                          <p className="text-sm text-text-muted">{inquiry.guest_count} guests</p>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Calendar className="w-4 h-4" />
                          {formatDate(inquiry.event_date)}
                        </div>
                      </td>
                      <td className="p-4 hidden lg:table-cell">
                        <span className="text-text-primary">{formatCurrency(inquiry.budget || 0)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-2">
                          <Badge className={getStatusClass(inquiry.status)}>
                            {inquiry.status}
                          </Badge>
                          <span className={cn('badge text-xs', getPriorityClass(inquiry.priority))}>
                            {inquiry.priority}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInquiry(inquiry)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {inquiry.status === 'pending' && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(inquiry.id, 'contacted')}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Mail className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(inquiry.id, 'confirmed')}
                                className="text-green-400 hover:text-green-300"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusUpdate(inquiry.id, 'rejected')}
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

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <p className="text-sm text-text-secondary">
                  Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} results
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-text-primary px-3">
                    Page {page} of {pagination.pages}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={page === pagination.pages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Inquiry Details Modal */}
      <AnimatePresence>
        {selectedInquiry && (
          <InquiryDetails
            inquiry={selectedInquiry}
            onClose={() => setSelectedInquiry(null)}
            onStatusUpdate={handleStatusUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}