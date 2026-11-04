import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { usePendingOrdersCount } from "../hooks/useOrders";
import { useAuth } from "../store/authStore";
import { selectCount, useCart } from "../store/cartStore";
import { CartIcon, CloseIcon, MenuIcon, WrenchIcon } from "./icons";

const navLink = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-md px-3 py-3 text-[0.95rem] font-medium transition-colors md:py-2 ${
    isActive ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
  }`;

export default function Layout() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useCart(selectCount);
  const pendingCount = usePendingOrdersCount();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  const closeMenu = () => setMenuOpen(false);

  function handleLogout() {
    closeMenu();
    logout();
    navigate("/");
  }

  const links = (
    <>
      <NavLink to="/" end className={navLink} onClick={closeMenu}>
        Peças
      </NavLink>

      {user ? (
        <>
          <NavLink to="/pedidos" className={navLink} onClick={closeMenu}>
            Meus pedidos
            {pendingCount > 0 && (
              <span className="rounded-full bg-white/20 px-2 text-xs font-semibold">{pendingCount}</span>
            )}
          </NavLink>
          {user.role === "admin" && (
            <NavLink to="/admin" className={navLink} onClick={closeMenu}>
              Painel admin
            </NavLink>
          )}
          <NavLink to="/conta" className={navLink} onClick={closeMenu}>
            Minha conta
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md px-3 py-3 text-left text-[0.95rem] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white md:py-2"
          >
            Sair
          </button>
        </>
      ) : (
        <>
          <NavLink to="/login" className={navLink} onClick={closeMenu}>
            Entrar
          </NavLink>
          <Link
            to="/cadastro"
            onClick={closeMenu}
            className="rounded-md bg-brass px-4 py-3 text-center text-[0.95rem] font-semibold text-garage-950 transition-colors hover:bg-brass-dark md:py-2"
          >
            Criar conta
          </Link>
        </>
      )}
    </>
  );

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-brass focus:px-4 focus:py-2 focus:font-semibold focus:text-garage-950"
      >
        Ir para o conteúdo
      </a>

      <header className="on-dark sticky top-0 z-30 bg-garage-900 text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-brass text-garage-950">
              <WrenchIcon className="h-5 w-5" />
            </span>
            <span className="font-display text-2xl font-bold tracking-tight">Auto Parts</span>
          </Link>

          <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
            {links}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              to="/carrinho"
              onClick={closeMenu}
              aria-label={`Carrinho, ${cartCount} ${cartCount === 1 ? "item" : "itens"}`}
              className="relative grid h-11 w-11 place-items-center rounded-md transition-colors hover:bg-white/10"
            >
              <CartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brass px-1 text-xs font-bold text-garage-950">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              className="grid h-11 w-11 place-items-center rounded-md transition-colors hover:bg-white/10 md:hidden"
            >
              {menuOpen ? <CloseIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            id="menu-mobile"
            aria-label="Menu"
            className="border-t border-white/10 px-4 pb-4 pt-2 md:hidden"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-1">{links}</div>
          </nav>
        )}
      </header>

      <main id="conteudo" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 outline-none sm:py-8">
        <Outlet />
      </main>

      <footer className="mt-16 border-t bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-xl font-semibold text-ink">Auto Parts</p>
          <p>Projeto de portfólio. Nenhuma compra é real e nenhum pagamento é processado.</p>
        </div>
      </footer>
    </div>
  );
}