import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./auth/RequireAuth";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import Pokedex from "./pages/Pokedex";
import Receitas from "./pages/Receitas";
import Skills from "./pages/Skills";
import Ingredientes from "./pages/Ingredientes";
import Banco from "./pages/Banco";
import Settings from "./pages/Settings";


import Landing from "./pages/Langing";


import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Navigate to="/sobre" replace />} />

      {/* Public auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* OAuth callback */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Public pages */}
      <Route path="/sobre" element={<Landing />} />

      {/* Public catalog pages (se quiser proteger, move pra dentro do /dashboard protegido) */}
      <Route path="/dashboard/pokedex" element={<Pokedex />} />
      <Route path="/dashboard/receitas" element={<Receitas />} />
      <Route path="/dashboard/skills" element={<Skills />} />
      <Route path="/dashboard/ingredientes" element={<Ingredientes />} />

      {/* Protected dashboard routes */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/banco"
        element={
          <RequireAuth>
            <Banco />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <RequireAuth>
            <Settings />
          </RequireAuth>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}