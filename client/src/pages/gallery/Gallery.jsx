import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Upload,
  Trash2,
  X,
  Image,
  Filter,
  ZoomIn
} from 'lucide-react';
import { vendorApi } from '@/api/client';
import { cn } from '@/lib/utils';
import { Card, Badge, Button, Skeleton, EmptyState, Dialog } from '@/components/ui';
import { useToast } from '@/components/ui';

const categories = [
  { value: 'all', label: 'All' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'events', label: 'Events' },
  { value: 'team', label: 'Team' },
  { value: 'venue', label: 'Venue' }
];

export default function Gallery() {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['gallery', categoryFilter],
    queryFn: async () => {
      const response = await vendorApi.getGallery();
      return response.data;
    },
    staleTime: 0,
    refetchOnMount: true
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) => vendorApi.uploadGallery(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(['gallery']);
      showToast('Success', 'Image uploaded successfully', 'success');
    },
    onError: (error) => {
      showToast('Error', error.message || 'Failed to upload image', 'error');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => vendorApi.deleteGallery(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['gallery']);
      setSelectedImage(null);
      showToast('Success', 'Image deleted successfully', 'success');
    },
    onError: (error) => {
      showToast('Error', error.message || 'Failed to delete image', 'error');
    }
  });

  const getGalleryData = () => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data?.gallery)) return data.data.gallery;
    if (Array.isArray(data.data?.data)) return data.data.data;
    if (Array.isArray(data.data)) return data.data;
    return [];
  };
  const allImages = getGalleryData().map(img => ({
    ...img,
    id: img._id,
    url: img.image_url || img.url
  }));
  const images = categoryFilter === 'all'
    ? allImages
    : allImages.filter(img => img.category === categoryFilter);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    if (categoryFilter !== 'all') {
      formData.append('category', categoryFilter);
    }

    uploadMutation.mutate(formData);
    e.target.value = '';
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      deleteMutation.mutate(id);
    }
  };

  const openPreview = (image) => {
    setPreviewImage(image);
  };

  if (error) {
    return (
      <EmptyState
        icon={Image}
        title="Error loading gallery"
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
            Gallery
          </h1>
          <p className="text-text-secondary mt-1">
            Manage your portfolio images
          </p>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            isLoading={uploadMutation.isPending}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Images
          </Button>
        </div>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2"
      >
        <Filter className="w-4 h-4 text-text-muted" />
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                categoryFilter === cat.value
                  ? 'bg-accent-primary text-white'
                  : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Masonry Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <Card>
          <EmptyState
            icon={Image}
            title="No images yet"
            description="Start by uploading your first images"
            action={
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Images
              </Button>
            }
          />
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4"
        >
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="break-inside-avoid"
            >
              <Card
                hover
                className="p-0 overflow-hidden group cursor-pointer"
                onClick={() => openPreview(image)}
              >
                <div className="relative">
                  <img
                    src={image.url || image.image_url}
                    alt={image.alt || 'Gallery image'}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPreview(image);
                      }}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <ZoomIn className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(image.id);
                      }}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                    </button>
                  </div>
                  {image.category && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" className="capitalize">
                        {image.category}
                      </Badge>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 rounded-lg bg-background-tertiary hover:bg-background-secondary transition-colors"
            >
              <X className="w-6 h-6 text-text-muted" />
            </button>
            <img
              src={previewImage.url || previewImage.image_url}
              alt={previewImage.alt || 'Gallery image'}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
              <div className="flex items-center justify-between">
                <div>
                  {previewImage.category && (
                    <Badge variant="default" className="capitalize">
                      {previewImage.category}
                    </Badge>
                  )}
                  {previewImage.caption && (
                    <p className="text-white mt-2">{previewImage.caption}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(previewImage.id)}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}