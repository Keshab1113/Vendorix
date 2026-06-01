import { motion } from 'framer-motion';
import {
  X,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Clock
} from 'lucide-react';
import { inquiryApi } from '@/api/client';
import { useToastStore } from '@/store';
import { formatDate, formatDateTime, formatCurrency, cn } from '@/lib/utils';
import { Button, Badge, Card, Skeleton } from '@/components/ui';

export default function InquiryDetails({ inquiry, onClose, onStatusUpdate }) {
  const toast = useToastStore();

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

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-background-secondary border border-border rounded-2xl shadow-xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-border bg-background-secondary">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Inquiry Details</h2>
            <p className="text-sm text-text-muted mt-1">#{inquiry.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-background-tertiary transition-colors text-text-muted hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status & Priority */}
          <div className="flex flex-wrap gap-3">
            <Badge className={getStatusClass(inquiry.status)}>
              {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
            </Badge>
            <Badge className={cn('badge border', getPriorityClass(inquiry.priority))}>
              {inquiry.priority.charAt(0).toUpperCase() + inquiry.priority.slice(1)} Priority
            </Badge>
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-3">Customer Information</h3>
            <Card className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Name</p>
                  <p className="text-text-primary font-medium">{inquiry.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-400/10 text-green-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Email</p>
                  <a href={`mailto:${inquiry.customer_email}`} className="text-accent-blue hover:underline">
                    {inquiry.customer_email}
                  </a>
                </div>
              </div>
              {inquiry.customer_phone && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-400/10 text-purple-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Phone</p>
                    <a href={`tel:${inquiry.customer_phone}`} className="text-text-primary">
                      {inquiry.customer_phone}
                    </a>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Event Details */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-3">Event Details</h3>
            <Card className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-yellow-400/10 text-yellow-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Date</p>
                    <p className="text-text-primary">{formatDate(inquiry.event_date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-400/10 text-cyan-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Guests</p>
                    <p className="text-text-primary">{inquiry.guest_count || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-400/10 text-green-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Budget</p>
                  <p className="text-text-primary font-medium">{formatCurrency(inquiry.budget || 0)}</p>
                </div>
              </div>
              {inquiry.event_location && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-pink-400/10 text-pink-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted">Location</p>
                    <p className="text-text-primary">{inquiry.event_location}</p>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Notes */}
          {inquiry.notes && (
            <div>
              <h3 className="text-sm font-medium text-text-secondary mb-3">Additional Notes</h3>
              <Card className="p-4">
                <p className="text-text-primary whitespace-pre-wrap">{inquiry.notes}</p>
              </Card>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-3">Timeline</h3>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm text-text-muted">Created</p>
                  <p className="text-text-primary">{formatDateTime(inquiry.created_at)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 p-6 border-t border-border bg-background-secondary">
          {inquiry.status === 'pending' && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  onStatusUpdate(inquiry.id, 'contacted');
                  onClose();
                }}
              >
                Mark as Contacted
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  onStatusUpdate(inquiry.id, 'confirmed');
                  onClose();
                }}
                className="text-green-400 border-green-400/30 hover:bg-green-400/10"
              >
                Accept
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  onStatusUpdate(inquiry.id, 'rejected');
                  onClose();
                }}
              >
                Reject
              </Button>
            </>
          )}
          {inquiry.status === 'confirmed' && (
            <Button
              variant="secondary"
              onClick={() => {
                onStatusUpdate(inquiry.id, 'completed');
                onClose();
              }}
            >
              Mark as Completed
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}