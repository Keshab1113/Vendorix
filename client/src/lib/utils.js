import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(date, options = {}) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options
  });
}

export function formatDateTime(date) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
}

export function getStatusColor(status) {
  const colors = {
    pending: 'yellow',
    contacted: 'blue',
    confirmed: 'green',
    rejected: 'red',
    completed: 'purple',
    cancelled: 'red',
    in_progress: 'cyan'
  };
  return colors[status] || 'gray';
}

export function getPriorityColor(priority) {
  const colors = {
    low: 'gray',
    medium: 'yellow',
    high: 'red'
  };
  return colors[priority] || 'gray';
}

export function truncate(str, length = 50) {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

export function generateSlug(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function debounce(func, wait = 500) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}