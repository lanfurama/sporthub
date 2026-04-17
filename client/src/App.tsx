import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import { SUPPORTED_LANGS, type SupportedLang } from './i18n';

// Customer pages
import HomePage from './pages/customer/HomePage';
import BookingFlow from './pages/customer/BookingFlow';
import BookingSuccessPage from './pages/customer/BookingSuccessPage';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin pages
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminBookingsPage from './pages/admin/BookingsPage';
import AdminBookPage from './pages/admin/AdminBookPage';
import AdminMembersPage from './pages/admin/MembersPage';
import AdminProductsPage from './pages/admin/ProductsPage';
import AdminOrdersPage from './pages/admin/OrdersPage';

function LangSync({ children }: { children: React.ReactNode }) {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && SUPPORTED_LANGS.includes(lang as SupportedLang)) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root to /en */}
        <Route path="/" element={<Navigate to="/en" replace />} />

        {/* Language-prefixed customer routes */}
        <Route path="/:lang" element={<LangSync><HomePage /></LangSync>} />
        <Route path="/:lang/book" element={<LangSync><BookingFlow /></LangSync>} />
        <Route path="/:lang/booking/success" element={<LangSync><BookingSuccessPage /></LangSync>} />
        <Route path="/:lang/login" element={<LangSync><LoginPage /></LangSync>} />
        <Route path="/:lang/register" element={<LangSync><RegisterPage /></LangSync>} />

        {/* Admin routes (no lang prefix) */}
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

        {/* Catch-all: redirect to /en */}
        <Route path="*" element={<Navigate to="/en" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
