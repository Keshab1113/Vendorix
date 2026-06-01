import { motion } from 'framer-motion';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  DollarSign,
  CheckCircle,
  X
} from 'lucide-react';
import { vendorApi } from '@/api/client';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, Badge, Button, Skeleton, EmptyState, Dialog } from '@/components/ui';
import { useToast } from '@/components/ui';

const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  duration_minutes: z.number().int().positive().optional(),
  price: z.number().min(0, 'Price must be positive'),
  is_active: z.boolean().optional()
});

const serviceDefaultValues = {
  name: '',
  description: '',
  duration_minutes: 60,
  price: 0,
  is_active: true
};

export default function Services() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: vendorApi.getServices
  });

  const createMutation = useMutation({
    mutationFn: (data) => vendorApi.createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      setIsDialogOpen(false);
      reset(serviceDefaultValues);
      showToast('Success', 'Service created successfully', 'success');
    },
    onError: (error) => {
      showToast('Error', error.message || 'Failed to create service', 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => vendorApi.updateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      setIsDialogOpen(false);
      setEditingService(null);
      reset(serviceDefaultValues);
      showToast('Success', 'Service updated successfully', 'success');
    },
    onError: (error) => {
      showToast('Error', error.message || 'Failed to update service', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => vendorApi.deleteService(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
      showToast('Success', 'Service deleted successfully', 'success');
    },
    onError: (error) => {
      showToast('Error', error.message || 'Failed to delete service', 'error');
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(serviceSchema),
    defaultValues: serviceDefaultValues
  });

  const getServicesData = () => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data?.services)) return data.data.services;
    if (Array.isArray(data.data?.data)) return data.data.data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };
  const services = getServicesData();

  const handleOpenDialog = (service = null) => {
    if (service) {
      setEditingService(service);
      reset({
        name: service.name || '',
        description: service.description || '',
        duration_minutes: service.duration_minutes || 60,
        price: service.price || 0,
        is_active: service.is_active !== false
      });
    } else {
      setEditingService(null);
      reset(serviceDefaultValues);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingService(null);
    reset(serviceDefaultValues);
  };

  const onSubmit = (formData) => {
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteMutation.mutate(id);
    }
  };

  if (error) {
    return (
      <EmptyState
        icon={CheckCircle}
        title="Error loading services"
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
            Services
          </h1>
          <p className="text-text-secondary mt-1">
            Manage your services and pricing
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </motion.div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card>
          <EmptyState
            icon={CheckCircle}
            title="No services yet"
            description="Start by adding your first service"
            action={
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            }
          />
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover className="h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary">{service.name}</h3>
                    {service.is_active === false && (
                      <Badge variant="error" className="mt-1">Inactive</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenDialog(service)}
                      className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-text-muted" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>

                {service.description && (
                  <p className="text-sm text-text-secondary mb-4 flex-1">
                    {service.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{service.duration_minutes || 60} mins</span>
                  </div>
                  <div className="text-xl font-bold text-accent-primary">
                    {formatCurrency(service.price)}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <div className="bg-background-secondary border border-border rounded-2xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              {editingService ? 'Edit Service' : 'Add Service'}
            </h2>
            <button
              onClick={handleCloseDialog}
              className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Service Name *</label>
              <input
                id="name"
                type="text"
                placeholder="Enter service name"
                className="input-field w-full"
                {...register('name')}
              />
              {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">Description</label>
              <textarea
                placeholder="Enter service description"
                rows={3}
                className="input-field w-full resize-none"
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="duration_minutes" className="block text-sm font-medium text-text-secondary">Duration (minutes)</label>
                <input
                  id="duration_minutes"
                  type="number"
                  placeholder="60"
                  className="input-field w-full"
                  {...register('duration_minutes', { valueAsNumber: true })}
                />
                {errors.duration_minutes && <p className="text-sm text-red-400">{errors.duration_minutes.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="price" className="block text-sm font-medium text-text-secondary">Price *</label>
                <input
                  id="price"
                  type="number"
                  placeholder="0"
                  className="input-field w-full"
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price && <p className="text-sm text-red-400">{errors.price.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                className="w-4 h-4 rounded border-border bg-background-tertiary text-accent-primary focus:ring-accent-primary"
                {...register('is_active')}
              />
              <label htmlFor="is_active" className="text-sm text-text-secondary">
                Active (visible to customers)
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={handleCloseDialog}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                isLoading={createMutation.isPending || updateMutation.isPending}
              >
                {editingService ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
}