import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useAuthStore, useToastStore } from '@/store';
import { Button, Input } from '@/components/ui';
import { registerSchema } from '@/lib/validations';

export default function Signup() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const toast = useToastStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data) => {
    const result = await registerUser(data.email, data.password);

    if (result.success) {
      toast.success('Account created successfully!', 'Welcome to Vendorix');
      navigate('/dashboard');
    } else {
      toast.error(result.message || 'Registration failed');
    }
  };

  const passwordRequirements = [
    { met: false, text: 'At least 8 characters' },
    { met: false, text: 'One uppercase letter' },
    { met: false, text: 'One number' },
    { met: false, text: 'One special character' }
  ];

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
              Create your account
            </h1>
            <p className="text-text-secondary">
              Start managing your vendor business today
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-[38px] text-text-muted hover:text-text-primary transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Password requirements */}
            <div className="p-4 rounded-xl bg-background-tertiary/50 space-y-2">
              <p className="text-sm text-text-secondary mb-2">Password requirements:</p>
              {passwordRequirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border border-border flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-text-muted" />
                  </div>
                  <span className="text-sm text-text-muted">{req.text}</span>
                </div>
              ))}
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
                  Create account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-sm text-text-secondary">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-accent-blue hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-accent-blue hover:underline">Privacy Policy</a>
          </p>

          {/* Sign in link */}
          <p className="mt-6 text-center text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-blue hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent-purple/20 via-accent-blue/10 to-accent-cyan/10 items-center justify-center p-12">
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
              Everything You Need<br />
              <span className="gradient-text">to Succeed</span>
            </h2>
            <div className="space-y-4 text-left max-w-md mx-auto">
              {[
                'Track bookings and inquiries in one place',
                'Beautiful analytics dashboard',
                'Professional profile management',
                '24/7 customer support'
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl glass"
                >
                  <div className="w-6 h-6 rounded-full bg-green-400/20 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-text-primary">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}