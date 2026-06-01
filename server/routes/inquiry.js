import express from 'express';
import {
  getInquiries,
  getInquiryById,
  createInquiry,
  updateInquiry,
  updateInquiryStatus,
  deleteInquiry,
  getInquiryStats
} from '../controllers/inquiryController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../validators/auth.js';
import { inquirySchema } from '../validators/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getInquiries);
router.get('/stats', getInquiryStats);
router.get('/:id', getInquiryById);
router.post('/', validate(inquirySchema), createInquiry);
router.put('/:id', validate(inquirySchema), updateInquiry);
router.patch('/:id/status', updateInquiryStatus);
router.delete('/:id', deleteInquiry);

export default router;