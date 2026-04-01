import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// Customer pages
import HomePage from './pages/customer/HomePage';
import BookingFlow from './pages/customer/BookingFlow';
import BookingSuccessPage from './pages/customer/BookingSuccessPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin pages (will be created)
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminBookingsPage from './pages/admin/BookingsPage';
import AdminBookPage from './pages/admin/AdminBookPage';
import AdminMembersPage from './pages/admin/MembersPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import AdminOrdersPage from './pages/admin/OrdersPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/book" element={<BookingFlow />} />
        <Route path="/booking/success" element={<BookingSuccessPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="staff">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="book" element={<AdminBookPage />} />
          <Route path="members" element={<AdminMembersPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
