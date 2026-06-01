import express from 'express';
import {
  getDashboardStats,
  getAnalytics,
  getRevenueData,
  getRecentActivity
} from '../controllers/dashboardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);
router.get('/revenue', getRevenueData);
router.get('/recent-activity', getRecentActivity);

export default router;