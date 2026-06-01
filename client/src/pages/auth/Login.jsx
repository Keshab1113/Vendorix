import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore, useToastStore } from '@/store';
import { Button } from '@/components/ui';
import { loginSchema } from '@/lib/validations';

const showComingSoon = (e, toast, provider) => {
  e.preventDefault();
  toast.info('Coming Soon', `${provider} login is not available yet`);
};

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const toast = useToastStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'demo@vendorix.com',
      password: 'password123',
      remember: false
    }
  });

  const onSubmit = async (data) => {
    try {
      const result = await login(data.email, data.password, data.remember);

      if (result?.success) {
        toast.success('Welcome back!', 'Login successful');
        navigate('/dashboard');
      } else {
        toast.error(result?.message || 'Login failed');
      }
    } catch (err) {
      toast.error('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <span className="font-heading font-bold text-2xl gradient-text">Vendorix</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
              Welcome back
            </h1>
            <p className="text-text-secondary">
              Sign in to manage your bookings and inquiries
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mb-6 p-4 rounded-xl bg-accent-blue/10 border border-accent-blue/20">
            <p className="text-sm text-accent-blue font-medium mb-1">Demo Credentials</p>
            <p className="text-xs text-text-secondary">Email: demo@vendorix.com</p>
            <p className="text-xs text-text-secondary">Password: password123</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="input-field"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
            </div>

            <div className="relative space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary">Password</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="input-field"
                {...register('password')}
              />
              {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('remember')}
                  className="w-4 h-4 rounded border-border bg-background-secondary text-accent-blue focus:ring-accent-blue/50"
                />
                <span className="text-sm text-text-secondary">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-accent-blue hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Social login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background text-text-muted">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={(e) => showComingSoon(e, toast, 'Google')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-background-tertiary transition-colors opacity-60 cursor-not-allowed"
                disabled
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm text-text-secondary">Google</span>
              </button>
              <button
                onClick={(e) => showComingSoon(e, toast, 'GitHub')}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-background-tertiary transition-colors opacity-60 cursor-not-allowed"
                disabled
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm text-text-secondary">GitHub</span>
              </button>
            </div>
          </div>

          {/* Sign up link */}
          <p className="mt-8 text-center text-text-secondary">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent-blue hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent-blue/20 via-accent-purple/10 to-accent-cyan/10 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center mb-8">
              <span className="text-white font-bold text-4xl">V</span>
            </div>
            <h2 className="text-3xl font-heading font-bold text-text-primary mb-4">
              Manage Your Business<br />
              <span className="gradient-text">Like a Pro</span>
            </h2>
            <p className="text-text-secondary text-lg">
              Track bookings, manage inquiries, and grow your vendor business with our powerful dashboard.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div>
                <p className="text-3xl font-bold gradient-text">10K+</p>
                <p className="text-sm text-text-muted">Vendors</p>
              </div>
              <div>
                <p className="text-3xl font-bold gradient-text">50K+</p>
                <p className="text-sm text-text-muted">Bookings</p>
              </div>
              <div>
                <p className="text-3xl font-bold gradient-text">99%</p>
                <p className="text-sm text-text-muted">Satisfaction</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}