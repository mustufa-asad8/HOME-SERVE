import type { Analytics, Appointment, Category, Service, User } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? '/api';
const fallbackImage = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80';

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('homeserve_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: 'Unexpected server error' }));
    throw new Error(payload.message ?? 'Request failed');
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const durationLabel = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`;
  const hours = minutes / 60;
  return Number.isInteger(hours) ? `${hours} hour${hours === 1 ? '' : 's'}` : `${minutes} min`;
};

export function mapUser(raw: Record<string, unknown>): User {
  const name = String(raw.name ?? 'HomeServe user');
  return {
    id: String(raw.id),
    name,
    email: String(raw.email),
    role: raw.role as User['role'],
    city: String(raw.city ?? ''),
    avatar: name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    isActive: Boolean(raw.is_active ?? true),
  };
}

export function mapCategory(raw: Record<string, unknown>): Category {
  return {
    id: String(raw.id),
    name: String(raw.name),
    icon: String(raw.icon ?? 'Sparkles'),
    description: String(raw.description ?? ''),
  };
}

export function mapService(raw: Record<string, unknown>): Service {
  const durationMinutes = Number(raw.duration_minutes ?? 60);
  return {
    id: String(raw.id),
    providerId: String(raw.provider),
    title: String(raw.title),
    category: String(raw.category),
    categoryName: String(raw.category_name ?? raw.category),
    city: String(raw.city),
    price: Number(raw.price),
    priceUnit: String(raw.price_unit ?? 'visit'),
    rating: Number(raw.rating ?? 0),
    reviews: Number(raw.review_count ?? 0),
    durationMinutes,
    duration: durationLabel(durationMinutes),
    provider: String(raw.provider_name ?? 'HomeServe provider'),
    verified: Boolean(raw.provider_verified),
    image: String(raw.image_url || fallbackImage),
    description: String(raw.description ?? ''),
    isActive: Boolean(raw.is_active ?? true),
  };
}

export function mapAppointment(raw: Record<string, unknown>): Appointment {
  return {
    id: String(raw.id),
    serviceId: String(raw.service_id),
    serviceTitle: String(raw.service_title),
    providerId: String(raw.provider_id),
    provider: String(raw.provider_name),
    customerId: String(raw.customer_id),
    customer: String(raw.customer_name),
    customerEmail: String(raw.customer_email ?? ''),
    providerEmail: String(raw.provider_email ?? ''),
    date: String(raw.date),
    time: String(raw.time).slice(0, 5),
    status: raw.status as Appointment['status'],
    address: String(raw.address),
    notes: String(raw.notes ?? ''),
    amount: Number(raw.amount),
  };
}

export function mapAnalytics(raw: Record<string, unknown>): Analytics {
  return {
    users: (raw.users as Analytics['users']) ?? [],
    appointmentsByStatus: ((raw.appointments_by_status ?? []) as Array<{ status: Analytics['appointmentsByStatus'][number]['status']; count: number }>),
    completedJobs: Number(raw.completed_jobs ?? 0),
    grossBookingValue: Number(raw.gross_booking_value ?? 0),
    activeServices: Number(raw.active_services ?? 0),
  };
}
