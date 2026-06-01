import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Bug } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        {/* Animated 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            <h1 className="text-[120px] md:text-[180px] font-bold text-transparent bg-clip-text bg-gradient-to-br from-accent-primary to-accent-purple leading-none">
              404
            </h1>
            <motion.div
              initial={{ rotate: -10, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="absolute -top-4 -right-4 md:top-0 md:right-0"
            >
              <Bug className="w-12 h-12 md:w-16 md:h-16 text-accent-primary/50" />
            </motion.div>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-text-primary mb-4">
            Page Not Found
          </h2>
          <p className="text-text-secondary max-w-md mx-auto mb-8">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/">
            <Button variant="primary" size="lg">
              <Home className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex items-center justify-center gap-8"
        >
          <div className="w-3 h-3 rounded-full bg-accent-primary/30" />
          <div className="w-3 h-3 rounded-full bg-accent-secondary/30" />
          <div className="w-3 h-3 rounded-full bg-purple-500/30" />
        </motion.div>
      </div>
    </div>
  );
}