import { Link, NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold text-blue-700">
            🔧 Auto Parts
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "text-blue-700" : "hover:text-blue-700")}>
              Peças
            </NavLink>
            <NavLink to="/carrinho" className={({ isActive }) => (isActive ? "text-blue-700" : "hover:text-blue-700")}>
              Carrinho
            </NavLink>
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