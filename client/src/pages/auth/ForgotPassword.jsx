import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { authApi } from '@/api/client';
import { useToastStore } from '@/store';
import { Button, Input } from '@/components/ui';
import { forgotPasswordSchema } from '@/lib/validations';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const toast = useToastStore();
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setIsSent(true);
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      // Don't reveal if email exists
      setIsSent(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-green-400/10 flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-text-primary mb-3">
            Check your email
          </h1>
          <p className="text-text-secondary mb-8">
            We've sent password reset instructions to your email address.
          </p>
          <p className="text-sm text-text-muted mb-8">
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={() => setIsSent(false)}
              className="text-accent-blue hover:underline"
            >
              try again
            </button>
          </p>
          <Link to="/login">
            <Button variant="secondary">
              Back to Sign in
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

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
              Forgot password?
            </h1>
            <p className="text-text-secondary">
              Enter your email and we'll send you reset instructions
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

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Send reset instructions
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Back to login */}
          <p className="mt-6 text-center text-text-secondary">
            Remember your password?{' '}
            <Link to="/login" className="text-accent-blue hover:underline font-medium">
              Sign in
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
              <Mail className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-heading font-bold text-text-primary mb-4">
              Secure Password<br />
              <span className="gradient-text">Recovery</span>
            </h2>
            <p className="text-text-secondary text-lg">
              We'll help you get back into your account safely and securely.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}