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

export default function App() {
  return(
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard/pokedex" element={<Pokedex/>} />
      <Route path="/dashboard/receitas" element={<Receitas/>} />
      <Route path="/dashboard/skills" element={<Skills/>} />
      <Route path="/dashboard/ingredientes" element={<Ingredientes/>} />
      <Route path="/dashboard/banco" element={<RequireAuth><Banco/></RequireAuth>} />
      <Route path="/dashboard/settings" element={<RequireAuth><Settings/></RequireAuth>} />
      <Route path="/sobre" element={<Landing/>} />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route path="*" element={<p>404</p>} />
    </Routes>
  )
}