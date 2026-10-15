import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store/authStore";

export default function AdminRoute() {
  const user = useAuth((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== "admin") {
    return (
      <div className="py-16 text-center">
        <h1 className="text-2xl font-bold">Acesso restrito</h1>
        <p className="mt-2 text-slate-500">Esta área é exclusiva para administradores.</p>
        <Link to="/" className="mt-4 inline-block text-blue-700 underline">Voltar para a loja</Link>
      </div>
    );
  }

  return <Outlet />;
}