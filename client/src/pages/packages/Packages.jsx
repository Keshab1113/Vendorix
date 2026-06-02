import { motion } from 'framer-motion';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  Star,
  X,
  Package
} from 'lucide-react';
import { vendorApi } from '@/api/client';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, Badge, Button, Input, Skeleton, EmptyState, Dialog, ConfirmDialog } from '@/components/ui';
import { useToast } from '@/components/ui';

const packageSchema = z.object({
  name: z.any(),
  description: z.any().optional(),
  price: z.any(),
  duration_minutes: z.any().optional(),
  features: z.any().optional(),
  is_featured: z.any().optional(),
  is_active: z.any().optional()
});

const packageDefaultValues = {
  name: '',
  description: '',
  price: 0,
  duration_minutes: 60,
  features: '',
  is_featured: false,
  is_active: true
};

export default function Packages() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['packages'],
    queryFn: vendorApi.getPackages
  });

  const createMutation = useMutation({
    mutationFn: (data) => vendorApi.createPackage(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['packages']);
      setIsDialogOpen(false);
      reset(packageDefaultValues);
      showToast('Success', 'Package created successfully', 'success');
    },
    onError: (error) => {
      showToast('Error', error.message || 'Failed to create package', 'error');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => vendorApi.updatePackage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['packages']);
      setIsDialogOpen(false);
      setEditingPackage(null);
      reset(packageDefaultValues);
      showToast('Success', 'Package updated successfully', 'success');
    },
    onError: (error) => {
      showToast('Error', error.message || 'Failed to update package', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => vendorApi.deletePackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['packages']);
      showToast('Success', 'Package deleted successfully', 'success');
    },
    onError: (error) => {
      showToast('Error', error.message || 'Failed to delete package', 'error');
    }
  });

  const {
    register,
    handleSubmit,
    reset
  } = useForm({
    defaultValues: packageDefaultValues
  });

  const getPackagesData = () => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data?.packages)) return data.data.packages;
    if (Array.isArray(data.data?.data)) return data.data.data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };
  const packages = getPackagesData().map(p => ({ ...p, id: p._id }));

  const handleOpenDialog = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      reset({
        name: pkg.name || '',
        description: pkg.description || '',
        price: pkg.price || 0,
        duration_minutes: pkg.duration_minutes || 60,
        features: pkg.features || '',
        is_featured: pkg.is_featured || false,
        is_active: pkg.is_active !== false
      });
    } else {
      setEditingPackage(null);
      reset(packageDefaultValues);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPackage(null);
    reset(packageDefaultValues);
  };

  const onSubmit = (formData) => {
    // Ensure required fields
    if (!formData.name || !formData.name.trim()) {
      showToast('Error', 'Package name is required', 'error');
      return;
    }

    // Ensure price is a number
    const processedData = {
      ...formData,
      name: formData.name.trim(),
      price: Number(formData.price) || 0,
      features: typeof formData.features === 'string'
        ? formData.features.split('\n').filter(f => f.trim())
        : (Array.isArray(formData.features) ? formData.features : [])
    };

    if (editingPackage && editingPackage.id) {
      updateMutation.mutate({ id: editingPackage.id, data: processedData });
    } else {
      createMutation.mutate(processedData);
    }
  };

  const handleDelete = (id) => {
    if (id && id !== 'undefined') {
      setDeleteConfirm(id);
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm && deleteConfirm !== 'undefined') {
      deleteMutation.mutate(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  if (error) {
    return (
      <EmptyState
        icon={Package}
        title="Error loading packages"
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
            Packages
          </h1>
          <p className="text-text-secondary mt-1">
            Manage your pricing packages
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Package
        </Button>
      </motion.div>

      {/* Packages Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-24" />
            </Card>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <Card>
          <EmptyState
            icon={Package}
            title="No packages yet"
            description="Start by adding your first pricing package"
            action={
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Package
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
          {packages.map((pkg, index) => {
            const features = typeof pkg.features === 'string'
              ? pkg.features.split('\n').filter(f => f.trim())
              : Array.isArray(pkg.features) ? pkg.features : [];

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  hover
                  className={cn(
                    'h-full flex flex-col relative',
                    pkg.is_featured && 'ring-2 ring-accent-primary'
                  )}
                >
                  {pkg.is_featured && (
                    <div className="absolute -top-3 -right-3">
                      <Badge variant="warning" className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Featured
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text-primary">{pkg.name}</h3>
                      {pkg.is_active === false && (
                        <Badge variant="error" className="mt-1">Inactive</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenDialog(pkg)}
                        className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-text-muted" />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {pkg.description && (
                    <p className="text-sm text-text-secondary mb-4 flex-1">
                      {pkg.description}
                    </p>
                  )}

                  {/* Features List */}
                  {features.length > 0 && (
                    <ul className="space-y-2 mb-4 flex-1">
                      {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-text-secondary">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      {pkg.duration_minutes && (
                        <>
                          <span>{pkg.duration_minutes} mins</span>
                        </>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-accent-primary">
                      {formatCurrency(pkg.price)}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <div className="bg-background-secondary border border-border rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              {editingPackage ? 'Edit Package' : 'Add Package'}
            </h2>
            <button
              onClick={handleCloseDialog}
              className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              type="text"
              placeholder="Enter package name"
              className="input-field w-full"
              {...register('name')}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">
                Description
              </label>
              <textarea
                placeholder="Enter package description"
                rows={3}
                className="input-field w-full resize-none"
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price"
                type="number"
                placeholder="0"
                {...register('price', { valueAsNumber: true })}
              />

              <Input
                label="Duration (minutes)"
                type="number"
                placeholder="60"
                {...register('duration_minutes', { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-text-secondary">
                Features (one per line)
              </label>
              <textarea
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                rows={4}
                className="input-field w-full resize-none"
                {...register('features')}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_featured"
                  className="w-4 h-4 rounded border-border bg-background-tertiary text-accent-primary focus:ring-accent-primary"
                  {...register('is_featured')}
                />
                <label htmlFor="is_featured" className="text-sm text-text-secondary">
                  Featured package
                </label>
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
                {editingPackage ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(confirm) => {
          if (confirm) confirmDelete();
          else setDeleteConfirm(null);
        }}
        title="Delete Package"
        message="Are you sure you want to delete this package? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}