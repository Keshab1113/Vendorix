import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  Save,
  Upload,
  Camera
} from 'lucide-react';
import { useAuthStore, useToastStore } from '@/store';
import { vendorApi } from '@/api/client';
import { profileSchema } from '@/lib/validations';
import { Card, Button, Input, Skeleton, Badge, Avatar } from '@/components/ui';

export default function Settings() {
  const { user, vendor, fetchUser } = useAuthStore();
  const toast = useToastStore();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('profile');

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      business_name: vendor?.business_name || '',
      category: vendor?.category || '',
      email: vendor?.email || user?.email || '',
      phone: vendor?.phone || '',
      address: vendor?.address || '',
      city: vendor?.city || '',
      state: vendor?.state || '',
      zip_code: vendor?.zip_code || '',
      country: vendor?.country || 'USA',
      description: vendor?.description || ''
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => vendorApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vendor-profile']);
      toast.success('Profile updated successfully');
      fetchUser();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  // Avatar upload mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: (formData) => vendorApi.updateAvatar(formData),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['vendor-profile']);
      toast.success('Profile image updated');
      fetchUser();
    },
    onError: () => {
      toast.error('Failed to upload image');
    }
  });

  const onSubmit = (data) => {
    updateProfileMutation.mutate(data);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      uploadAvatarMutation.mutate(formData);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'business', label: 'Business', icon: Building },
    { id: 'contact', label: 'Contact', icon: Mail }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-text-primary">
          Settings
        </h1>
        <p className="text-text-secondary mt-1">
          Manage your account and business settings
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="p-2 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? 'bg-accent-blue/10 text-accent-blue'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              {/* Avatar Section */}
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
                <div className="relative">
                  <Avatar
                    src={vendor?.profile_image}
                    fallback={user?.email?.[0]?.toUpperCase() || 'U'}
                    size="2xl"
                  />
                  <label className="absolute bottom-0 right-0 p-2 bg-accent-blue rounded-xl cursor-pointer hover:bg-accent-blue/90 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {vendor?.business_name || 'Your Business Name'}
                  </h3>
                  <p className="text-text-secondary">{user?.email}</p>
                  {vendor?.is_verified && (
                    <Badge variant="success" className="mt-2">Verified Vendor</Badge>
                  )}
                </div>
              </div>

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Business Name"
                      placeholder="Enter business name"
                      error={errors.business_name?.message}
                      {...register('business_name')}
                    />
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-text-secondary">
                        Category
                      </label>
                      <select
                        {...register('category')}
                        className="input-field"
                      >
                        <option value="">Select category</option>
                        <option value="Event Planning">Event Planning</option>
                        <option value="Catering">Catering</option>
                        <option value="Photography">Photography</option>
                        <option value="Videography">Videography</option>
                        <option value="Decor">Decor</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Venue">Venue</option>
                        <option value="Transportation">Transportation</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.category && (
                        <p className="text-sm text-red-400">{errors.category.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="you@example.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <Input
                      label="Phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      Description
                    </label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      placeholder="Tell customers about your business..."
                      className="input-field resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Business Tab */}
              {activeTab === 'business' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input
                      label="City"
                      placeholder="City"
                      {...register('city')}
                    />
                    <Input
                      label="State"
                      placeholder="State"
                      {...register('state')}
                    />
                    <Input
                      label="ZIP Code"
                      placeholder="12345"
                      {...register('zip_code')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      Country
                    </label>
                    <select
                      {...register('country')}
                      className="input-field"
                    >
                      <option value="USA">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>

                  <Input
                    label="Full Address"
                    placeholder="123 Main St, Suite 400"
                    {...register('address')}
                  />
                </div>
              )}

              {/* Contact Tab */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-background-tertiary/50">
                    <p className="text-sm text-text-secondary mb-1">Email Address</p>
                    <p className="text-text-primary font-medium">{user?.email}</p>
                    <p className="text-xs text-text-muted mt-1">Contact support to change your email</p>
                  </div>

                  <Input
                    label="Business Phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    {...register('phone')}
                  />

                  {vendor?.social_links && (
                    <div>
                      <p className="text-sm font-medium text-text-secondary mb-3">Social Links</p>
                      <div className="space-y-3">
                        {Object.entries(vendor.social_links).map(([platform, url]) => (
                          <div key={platform} className="flex items-center gap-3 p-3 rounded-xl bg-background-tertiary/50">
                            <Globe className="w-5 h-5 text-text-muted" />
                            <span className="text-text-secondary capitalize">{platform}:</span>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">
                              {url}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => reset()}
                  disabled={!isDirty || updateProfileMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isDirty || updateProfileMutation.isPending}
                  isLoading={updateProfileMutation.isPending}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}