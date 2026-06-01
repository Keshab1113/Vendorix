import { useAuthStore } from '@/store';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for authentication state and helpers
 * Provides a cleaner API for accessing auth store
 * @returns {object} Auth state and helper methods
 */
export function useAuth() {
  const navigate = useNavigate();
  const {
    user,
    vendor,
    accessToken,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    fetchUser,
    setAccessToken,
    setUser,
    setVendor
  } = useAuthStore();

  /**
   * Check if user has a specific role
   * @param {string|string[]} roles - Role or array of roles to check
   * @returns {boolean}
   */
  const hasRole = (roles) => {
    if (!user?.role) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  /**
   * Check if user has specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean}
   */
  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) ?? false;
  };

  /**
   * Check if vendor is verified
   * @returns {boolean}
   */
  const isVendorVerified = () => {
    return vendor?.isVerified ?? false;
  };

  /**
   * Handle logout with navigation
   * @param {string} redirectTo - Path to redirect to after logout
   */
  const handleLogout = async (redirectTo = '/login') => {
    await logout();
    navigate(redirectTo);
  };

  /**
   * Require authentication - redirect to login if not authenticated
   * @param {string} redirectTo - Path to redirect to if not authenticated
   */
  const requireAuth = (redirectTo = '/login') => {
    if (!isAuthenticated) {
      navigate(redirectTo);
      return false;
    }
    return true;
  };

  /**
   * Require specific role - redirect to dashboard if not authorized
   * @param {string|string[]} roles - Required role(s)
   * @param {string} redirectTo - Path to redirect to if not authorized
   */
  const requireRole = (roles, redirectTo = '/dashboard') => {
    if (!requireAuth()) return false;
    if (!hasRole(roles)) {
      navigate(redirectTo);
      return false;
    }
    return true;
  };

  return {
    // State
    user,
    vendor,
    accessToken,
    isAuthenticated,
    isLoading,

    // Auth methods
    login,
    register,
    logout: handleLogout,
    fetchUser,
    setAccessToken,
    setUser,
    setVendor,

    // Helper methods
    hasRole,
    hasPermission,
    isVendorVerified,
    requireAuth,
    requireRole,

    // Direct access to store for advanced usage
    store: useAuthStore
  };
}

export default useAuth;