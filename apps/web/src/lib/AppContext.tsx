import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { io } from 'socket.io-client';
import type { Analytics, Appointment, AppointmentStatus, Category, Notification, Role, Service, User } from './types';
import { apiRequest, mapAnalytics, mapAppointment, mapCategory, mapService, mapUser } from './api';

interface BookingInput {
  service: Service;
  date: string;
  time: string;
  address: string;
  notes?: string;
}

interface AuthInput {
  email: string;
  password: string;
  name?: string;
  role?: 'customer' | 'provider';
  city?: string;
}

interface ServiceInput {
  category: string;
  title: string;
  description: string;
  city: string;
  price: number;
  price_unit: string;
  duration_minutes: number;
  image_url: string;
}

interface AppContextValue {
  user: User | null;
  authenticated: boolean;
  initializing: boolean;
  loading: boolean;
  appointments: Appointment[];
  services: Service[];
  categories: Category[];
  providerServices: Service[];
  notifications: Notification[];
  analytics: Analytics | null;
  selectedService: Service | null;
  toast: string | null;
  login: (input: AuthInput) => Promise<User>;
  register: (input: Required<AuthInput>) => Promise<User>;
  loginDemo: (role: Role) => Promise<User>;
  logout: () => void;
  refreshData: () => Promise<void>;
  openBooking: (service: Service) => void;
  closeBooking: () => void;
  bookService: (input: BookingInput) => Promise<Appointment>;
  updateAppointment: (id: string, status: AppointmentStatus) => Promise<Appointment>;
  createService: (input: ServiceInput) => Promise<Service>;
  showToast: (message: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const demoCredentials: Record<Role, { email: string; password: string }> = {
  customer: { email: 'customer@homeserve.local', password: 'Password123!' },
  provider: { email: 'provider@homeserve.local', password: 'Password123!' },
  admin: { email: 'admin@homeserve.local', password: 'Password123!' },
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [providerServices, setProviderServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const loadMarketplace = useCallback(async () => {
    const [serviceRows, categoryRows] = await Promise.all([
      apiRequest<Array<Record<string, unknown>>>('/services'),
      apiRequest<Array<Record<string, unknown>>>('/services/categories'),
    ]);
    setServices(serviceRows.map(mapService));
    setCategories(categoryRows.map(mapCategory));
  }, []);

  const loadRoleData = useCallback(async (activeUser: User) => {
    const appointmentRows = await apiRequest<Array<Record<string, unknown>>>('/appointments');
    setAppointments(appointmentRows.map(mapAppointment));

    if (activeUser.role === 'provider') {
      const serviceRows = await apiRequest<Array<Record<string, unknown>>>('/services/mine');
      setProviderServices(serviceRows.map(mapService));
    } else {
      setProviderServices([]);
    }

    if (activeUser.role === 'admin') {
      const rawAnalytics = await apiRequest<Record<string, unknown>>('/admin/analytics');
      setAnalytics(mapAnalytics(rawAnalytics));
    } else {
      setAnalytics(null);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      await loadMarketplace();
      if (user) await loadRoleData(user);
    } finally {
      setLoading(false);
    }
  }, [loadMarketplace, loadRoleData, user]);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      try {
        await loadMarketplace();
        const token = localStorage.getItem('homeserve_token');
        if (!token) return;
        const result = await apiRequest<{ user: Record<string, unknown> }>('/auth/me');
        if (!active) return;
        const restoredUser = mapUser(result.user);
        setUser(restoredUser);
        await loadRoleData(restoredUser);
      } catch {
        localStorage.removeItem('homeserve_token');
        localStorage.removeItem('homeserve_user');
        if (active) setUser(null);
      } finally {
        if (active) setInitializing(false);
      }
    };
    void initialize();
    return () => { active = false; };
  }, [loadMarketplace, loadRoleData]);

  useEffect(() => {
    const token = localStorage.getItem('homeserve_token');
    if (!user || !token) return undefined;
    const socket = io({ auth: { token } });
    socket.on('notification', (payload: { appointment?: Record<string, unknown>; type?: string }) => {
      if (payload.appointment) {
        const updated = mapAppointment(payload.appointment);
        setAppointments((current) => {
          const exists = current.some((item) => item.id === updated.id);
          return exists ? current.map((item) => item.id === updated.id ? updated : item) : [updated, ...current];
        });
      }
      setNotifications((current) => [{
        id: `${Date.now()}`,
        title: payload.type === 'booking_created' ? 'New booking request' : 'Appointment updated',
        message: 'Your HomeServe workspace has new activity.',
        time: 'Just now',
        read: false,
      }, ...current]);
    });
    return () => { socket.disconnect(); };
  }, [user]);

  const persistSession = async (token: string, rawUser: Record<string, unknown>) => {
    const normalized = mapUser(rawUser);
    localStorage.setItem('homeserve_token', token);
    localStorage.setItem('homeserve_user', JSON.stringify(normalized));
    setUser(normalized);
    await loadRoleData(normalized);
    return normalized;
  };

  const login = async ({ email, password }: AuthInput) => {
    const result = await apiRequest<{ token: string; user: Record<string, unknown> }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const activeUser = await persistSession(result.token, result.user);
    showToast('Welcome back to HomeServe.');
    return activeUser;
  };

  const register = async ({ email, password, name, role, city }: Required<AuthInput>) => {
    const result = await apiRequest<{ token: string; user: Record<string, unknown> }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role, city }),
    });
    const activeUser = await persistSession(result.token, result.user);
    showToast('Your HomeServe account is ready.');
    return activeUser;
  };

  const loginDemo = (role: Role) => login(demoCredentials[role]);

  const logout = () => {
    localStorage.removeItem('homeserve_token');
    localStorage.removeItem('homeserve_user');
    setUser(null);
    setAppointments([]);
    setProviderServices([]);
    setAnalytics(null);
    setNotifications([]);
    showToast('Signed out successfully.');
  };

  const bookService = async ({ service, date, time, address, notes = '' }: BookingInput) => {
    const raw = await apiRequest<Record<string, unknown>>('/appointments', {
      method: 'POST',
      body: JSON.stringify({ service_id: service.id, date, time, address, notes }),
    });
    const appointment = mapAppointment(raw);
    setAppointments((current) => [appointment, ...current]);
    setSelectedService(null);
    showToast('Booking request sent to the provider.');
    return appointment;
  };

  const updateAppointment = async (id: string, status: AppointmentStatus) => {
    const raw = await apiRequest<Record<string, unknown>>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    const updated = mapAppointment(raw);
    setAppointments((current) => current.map((item) => item.id === id ? updated : item));
    if (user?.role === 'admin') {
      const rawAnalytics = await apiRequest<Record<string, unknown>>('/admin/analytics');
      setAnalytics(mapAnalytics(rawAnalytics));
    }
    showToast(`Appointment moved to ${status.replace('_', ' ')}.`);
    return updated;
  };

  const createService = async (input: ServiceInput) => {
    const raw = await apiRequest<Record<string, unknown>>('/services', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    const created = mapService(raw);
    setServices((current) => [created, ...current]);
    setProviderServices((current) => [created, ...current]);
    showToast('Service published to the marketplace.');
    return created;
  };

  return <AppContext.Provider value={{
    user,
    authenticated: Boolean(user && localStorage.getItem('homeserve_token')),
    initializing,
    loading,
    appointments,
    services,
    categories,
    providerServices,
    notifications,
    analytics,
    selectedService,
    toast,
    login,
    register,
    loginDemo,
    logout,
    refreshData,
    openBooking: setSelectedService,
    closeBooking: () => setSelectedService(null),
    bookService,
    updateAppointment,
    createService,
    showToast,
  }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
