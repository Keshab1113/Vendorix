import express from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBooking,
  updateBookingStatus,
  cancelBooking
} from '../controllers/bookingController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../validators/auth.js';
import { bookingSchema } from '../validators/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/', validate(bookingSchema), createBooking);
router.put('/:id', validate(bookingSchema), updateBooking);
router.patch('/:id/status', updateBookingStatus);
router.delete('/:id', cancelBooking);

export default router;