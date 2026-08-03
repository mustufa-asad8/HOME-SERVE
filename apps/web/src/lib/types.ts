export type Role = 'customer' | 'provider' | 'admin';
export type AppointmentStatus = 'pending' | 'confirmed' | 'in_progress' | 'completion_requested' | 'completed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  city: string;
  avatar: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Service {
  id: string;
  providerId: string;
  title: string;
  category: string;
  categoryName: string;
  city: string;
  price: number;
  priceUnit: string;
  rating: number;
  reviews: number;
  durationMinutes: number;
  duration: string;
  provider: string;
  verified: boolean;
  image: string;
  description: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  serviceId: string;
  serviceTitle: string;
  providerId: string;
  provider: string;
  customerId: string;
  customer: string;
  customerEmail: string;
  providerEmail: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  address: string;
  notes: string;
  amount: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface Analytics {
  users: Array<{ role: Role; count: number }>;
  appointmentsByStatus: Array<{ status: AppointmentStatus; count: number }>;
  completedJobs: number;
  grossBookingValue: number;
  activeServices: number;
}
