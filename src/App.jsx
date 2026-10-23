import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './layouts/AppLayout';
import LoginView from './features/auth/LoginView';
import RegisterView from './features/auth/RegisterView';
import DashboardView from './features/dashboard/DashboardView';
import ProductsView from './features/products/ProductsView';
import CategoriesView from './features/categories/CategoriesView';
import InventoryView from './features/inventory/InventoryView';
import PosView from './features/sales/PosView';
import ReportsView from './features/reports/ReportsView';
import SectionPlaceholder from './components/SectionPlaceholder';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <span className="text-xs font-mono">Verificando sesión segura...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090E] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <span className="text-xs font-mono">Cargando...</span>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <LoginView />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterView />
              </PublicOnlyRoute>
            }
          />

          {/* Protected Application Routes with Sidebar Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="products" element={<ProductsView />} />
            <Route path="categories" element={<CategoriesView />} />
            <Route path="inventory" element={<InventoryView />} />
            <Route path="sales" element={<PosView />} />
            <Route path="reports" element={<ReportsView />} />
            <Route
              path="settings/users"
              element={
                <SectionPlaceholder
                  title="Gestión de Usuarios y Cajeros"
                  phase="Fase 2: Permisos"
                  description="Invita cajeros y administra roles y accesos exclusivos para tu organización."
                />
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
