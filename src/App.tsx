import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Notices from './pages/Notices';
import History from './pages/History';
import Admin from './pages/Admin';
import Layout from './components/Layout';
import PWAInstallInstructions from './components/PWAInstallInstructions';

function AppRoutes() {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <>
      {!profile ? (
        <Login />
      ) : (
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="notices" element={<Notices />} />
            <Route path="history" element={<History />} />
            {profile.role === 'admin' && (
              <Route path="admin" element={<Admin />} />
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Routes>
      )}
      <PWAInstallInstructions />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}
