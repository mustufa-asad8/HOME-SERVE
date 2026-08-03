import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { dataService } from '../services/dataService.js';
import { canRoleTransition, canTransition } from '../utils/transitions.js';
import { sendEmail } from '../services/email.js';

const router = Router();
const unwrap = (data) => data?.results ?? data;

const nowInKarachi = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
};
router.use(authenticate);

const ownsAppointment = (user, appointment) => {
  if (user.role === 'admin') return true;
  if (user.role === 'customer') return appointment.customer_id === user.sub;
  if (user.role === 'provider') return appointment.provider_id === user.sub;
  return false;
};

router.get('/', async (req, res, next) => {
  try {
    const params = req.user.role === 'admin'
      ? req.query
      : { ...req.query, [req.user.role]: req.user.sub };
    const { data } = await dataService.get('/appointments/', { params });
    return res.json(unwrap(data));
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { data } = await dataService.get(`/appointments/${req.params.id}/`);
    if (!ownsAppointment(req.user, data)) return res.status(403).json({ message: 'You cannot access this appointment' });
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    if (req.user.role !== 'customer') return res.status(403).json({ message: 'Only customers can create bookings' });

    const body = z.object({
      service_id: z.string().uuid(),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
      address: z.string().trim().min(8).max(500),
      notes: z.string().trim().max(1000).optional().default(''),
    }).parse(req.body);

    const { data: service } = await dataService.get(`/services/${body.service_id}/`);
    if (!service.is_active) return res.status(409).json({ message: 'This service is not currently bookable' });

    const { data } = await dataService.post('/appointments/', {
      ...body,
      customer_id: req.user.sub,
      provider_id: service.provider,
    });

    req.app.get('io').to(`user:${service.provider}`).emit('notification', { type: 'booking_created', appointment: data });
    await sendEmail({
      to: data.provider_email,
      subject: 'New HomeServe booking request',
      text: `A new booking request for ${data.service_title} is waiting in your provider workspace.`,
    });
    return res.status(201).json(data);
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.non_field_errors) {
      return res.status(409).json({ message: error.response.data.non_field_errors[0] });
    }
    return next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const status = z.enum(['confirmed', 'in_progress', 'completion_requested', 'completed', 'cancelled']).parse(req.body.status);
    const { data: current } = await dataService.get(`/appointments/${req.params.id}/`);

    if (!ownsAppointment(req.user, current)) return res.status(403).json({ message: 'You cannot update this appointment' });
    if (!canTransition(current.status, status)) {
      return res.status(409).json({ message: `Cannot move appointment from ${current.status} to ${status}` });
    }
    if (!canRoleTransition(req.user.role, current.status, status)) {
      return res.status(403).json({ message: `${req.user.role}s cannot perform this status change` });
    }
    if (status === 'in_progress' && `${current.date}T${String(current.time).slice(0, 5)}` > nowInKarachi()) {
      return res.status(409).json({ message: 'A provider cannot start work before the scheduled appointment time' });
    }

    const { data } = await dataService.patch(`/appointments/${req.params.id}/`, { status });
    const notification = { type: 'booking_status', appointment: data };
    const io = req.app.get('io');
    io.to(`user:${current.customer_id}`).emit('notification', notification);
    io.to(`user:${current.provider_id}`).emit('notification', notification);

    const statusLabel = status.replaceAll('_', ' ');
    if (req.user.role === 'customer') {
      await sendEmail({
        to: current.provider_email,
        subject: `Customer updated a HomeServe booking`,
        text: `${current.customer_name} changed ${current.service_title} to ${statusLabel}.`,
      });
    } else if (req.user.role === 'provider') {
      await sendEmail({
        to: current.customer_email,
        subject: `HomeServe booking ${statusLabel}`,
        text: `Your appointment for ${current.service_title} is now ${statusLabel}.`,
      });
    } else {
      await Promise.all([
        sendEmail({
          to: current.customer_email,
          subject: `HomeServe booking ${statusLabel}`,
          text: `HomeServe operations changed your appointment for ${current.service_title} to ${statusLabel}.`,
        }),
        sendEmail({
          to: current.provider_email,
          subject: `HomeServe booking ${statusLabel}`,
          text: `HomeServe operations changed ${current.service_title} for ${current.customer_name} to ${statusLabel}.`,
        }),
      ]);
    }
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

export default router;
