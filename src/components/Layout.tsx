import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { usePendingOrdersCount } from "../hooks/useOrders";
import { selectCount, useCart } from "../store/cartStore";
import { useAuth } from "../store/authStore";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1 ${isActive ? "text-blue-700" : "hover:text-blue-700"}`;

function Counter({ value, color = "bg-blue-700" }: { value: number; color?: string }) {
  if (value <= 0) return null;
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold text-white ${color}`}>
      {value}
    </span>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const cartCount = useCart(selectCount);
  const pendingCount = usePendingOrdersCount();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="text-xl font-bold text-blue-700">
            🔧 Auto Parts
          </Link>

          <nav className="flex flex-wrap items-center gap-5 text-sm font-medium">
            <NavLink to="/" end className={linkClass}>Peças</NavLink>


            {user ? (
              <>
                {user.role === "admin" && (
                  <NavLink to="/admin" className={linkClass}>Admin</NavLink>
                )}

                {user.role === "customer" && (
                  <>
                    <NavLink to="/carrinho" className={linkClass}>
                      Carrinho <Counter value={cartCount} />
                    </NavLink>

                    <NavLink to="/pedidos" className={linkClass}>
                      Meus pedidos <Counter value={pendingCount} color="bg-amber-500" />
                    </NavLink>
                  </>

                )}

                <span className="hidden text-slate-400 sm:inline">|</span>
                <span className="hidden text-slate-500 sm:inline">Olá, {user.name}</span>
                <button onClick={handleLogout} className="text-red-600 hover:underline">
                  Sair
                </button>
              </>
            ) : (
              <NavLink to="/login" className={linkClass}>Entrar</NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t bg-white py-6 text-center text-sm text-slate-500">
        Projeto de portfólio · Auto Parts
      </footer>
    </div>
  );
}