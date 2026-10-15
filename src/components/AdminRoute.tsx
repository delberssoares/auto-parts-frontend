import { Link, Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store/authStore";

const tabClass = ({ isActive }: { isActive: boolean }) =>
  `-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
    isActive ? "border-blue-700 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"
  }`;

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

  return (
    <div>
      <nav className="mb-6 flex border-b">
        <NavLink to="/admin/pedidos" className={tabClass}>Pedidos</NavLink>
        <NavLink to="/admin/produtos" className={tabClass}>Produtos</NavLink>
      </nav>
      <Outlet />
    </div>
  );
}