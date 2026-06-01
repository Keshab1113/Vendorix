import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/api/client';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      vendor: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAccessToken: (token) => set({ accessToken: token }),

      login: async (email, password, remember) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login({ email, password, remember });
          const { user, vendor, accessToken } = response.data.data;

          set({
            user,
            vendor,
            accessToken,
            isAuthenticated: true,
            isLoading: false
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Login failed'
          };
        }
      },

      register: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register({ email, password });
          const { user, accessToken } = response.data.data;

          set({
            user: { ...user, isNew: true },
            accessToken,
            isAuthenticated: true,
            isLoading: false
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Registration failed'
          };
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          // Continue with logout even if API call fails
        }

        set({
          user: null,
          vendor: null,
          accessToken: null,
          isAuthenticated: false
        });
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const response = await authApi.getMe();
          const { user, vendor } = response.data.data;

          set({
            user,
            vendor,
            isAuthenticated: true,
            isLoading: false
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false };
        }
      },

      setUser: (user) => set({ user }),
      setVendor: (vendor) => set({ vendor })
    }),
    {
      name: 'vendorix-auth',
      partialize: (state) => ({
        user: state.user,
        vendor: state.vendor,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

// UI Store
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  theme: 'dark',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  closeMobileMenu: () => set({ mobileMenuOpen: false })
}));

// Toast Store
export const useToastStore = create((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = Date.now();
    const newToast = { id, ...toast };

    set((state) => ({
      toasts: [...state.toasts, newToast]
    }));

    // Auto remove after duration
    setTimeout(() => {
      get().removeToast(id);
    }, toast.duration || 5000);

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  },

  success: (message, title = 'Success') => {
    return get().addToast({ type: 'success', title, message });
  },

  error: (message, title = 'Error') => {
    return get().addToast({ type: 'error', title, message });
  },

  warning: (message, title = 'Warning') => {
    return get().addToast({ type: 'warning', title, message });
  },

  info: (message, title = 'Info') => {
    return get().addToast({ type: 'info', title, message });
  }
}));