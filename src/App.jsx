import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Public pages
import PublicLayout from './components/PublicLayout';
import Home from './pages/public/Home';
import PublicMenu from './pages/public/PublicMenu';
import PublicOrder from './pages/public/PublicOrder';
import PublicTables from './pages/public/PublicTables';
import StaffLogin from './pages/StaffLogin';

// Admin pages
import Layout from './components/Layout';
import AdminGuard from './components/AdminGuard';
import Dashboard from './pages/Dashboard';
import MenuManagement from './pages/MenuManagement';
import NewOrder from './pages/NewOrder';
import Orders from './pages/Orders';
import Kitchen from './pages/Kitchen';
import Tables from './pages/Tables';
import Analytics from './pages/Analytics';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<PublicMenu />} />
        <Route path="/order" element={<PublicOrder />} />
        <Route path="/tables" element={<PublicTables />} />
      </Route>

      {/* Staff Login */}
      <Route path="/staff-login" element={<StaffLogin />} />

      {/* Admin Routes — protected */}
      <Route path="/admin" element={<AdminGuard />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="menu" element={<MenuManagement />} />
          <Route path="new-order" element={<NewOrder />} />
          <Route path="orders" element={<Orders />} />
          <Route path="kitchen" element={<Kitchen />} />
          <Route path="tables" element={<Tables />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Route>

      {/* Redirect old routes to admin */}
      <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
      <Route path="/new-order" element={<Navigate to="/admin/new-order" replace />} />
      <Route path="/orders" element={<Navigate to="/admin/orders" replace />} />
      <Route path="/kitchen" element={<Navigate to="/admin/kitchen" replace />} />
      <Route path="/analytics" element={<Navigate to="/admin/analytics" replace />} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App