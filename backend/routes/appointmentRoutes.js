import express from 'express';
import { fetchAvailability, bookAppointment, fetchAppointmentsForWeek, updateAppointment, removeAppointment } from '../controllers/appointmentController.js';
const router = express.Router();

router.get('/availability', fetchAvailability);
router.post('/book', bookAppointment);
router.get('/week', fetchAppointmentsForWeek);
router.put('/:id', updateAppointment);
router.delete('/:id', removeAppointment);

export default router;
