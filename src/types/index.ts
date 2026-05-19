export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'guest' | 'member' | 'staff' | 'admin' | 'super_admin';
}

export interface Court {
  id: number;
  name: string;
  sport: string;
  priceNormal: number;
  pricePeak: number;
  peakStart: string;
  peakEnd: string;
  status: 'active' | 'inactive' | 'maintenance';
  description?: string;
}

export interface Plan {
  id: 'basic' | 'prime' | 'vip';
  name: string;
  price: number;
  durationDays: number;
  courtDiscountPct: number;
  shopDiscountPct: number;
  creditPerCycle: number;
  guestPasses: number;
  priorityBooking: boolean;
}

export interface Booking {
  id: string;
  ref: string;
  courtId: number;
  customerName: string;
  customerPhone: string;
  bookingDate: string;
  startTime: string;
  durationHours: number;
  basePrice: number;
  discountAmount: number;
  creditUsed: number;
  finalPrice: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  source: 'online' | 'walkin' | 'admin';
  payMethod?: string;
  note?: string;
  createdAt: string;
  court?: { name: string; sport: string };
}

export interface Membership {
  id: string;
  plan: 'basic' | 'prime' | 'vip';
  status: 'active' | 'expired' | 'suspended';
  startedAt: string;
  expiresAt: string;
  creditBalance: number;
  guestPasses: number;
}

export interface Member {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  memberships?: Membership[];
}

export interface Product {
  id: number;
  name: string;
  category?: string;
  price: number;
  stock: number;
  isService: boolean;
  status: 'active' | 'inactive';
}

export interface OrderItem {
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: string;
  subtotal: number;
  discountAmount: number;
  creditUsed: number;
  total: number;
  payMethod?: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  createdAt: string;
  items: OrderItem[];
}

export interface DashboardData {
  today: {
    bookingsCount: number;
    pendingCount: number;
    revenue: number;
  };
  members: {
    total: number;
    basic?: number;
    prime?: number;
    vip?: number;
  };
  recentBookings: Booking[];
  sourceBreakdown: {
    online: number;
    admin: number;
  };
  dailyBookings: {
    date: string;      // ISO yyyy-MM-dd
    bookings: number;
  }[];
}
