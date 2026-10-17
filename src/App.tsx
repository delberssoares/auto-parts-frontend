import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import NotFound from "./pages/NotFound";
import AdminRoute from "./components/AdminRoute";
import AdminProducts from "./pages/AdminProducts";
import AdminProductForm from "./pages/AdminProductForm";
import AdminOrders from "./pages/AdminOrders";
import AdminOrderDetail from "./pages/AdminOrderDetail";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import DevMailbox from "./pages/DevMailbox";
import { useSessionSync } from "./hooks/useSessionSync";
import Account from "./pages/Account";

export default function App() {
  useSessionSync();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Products />} />
        <Route path="produtos/:id" element={<ProductDetail />} />
        <Route path="carrinho" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="cadastro" element={<Register />} />

        <Route path="esqueci-senha" element={<ForgotPassword />} />
        <Route path="redefinir-senha" element={<ResetPassword />} />
        <Route path="dev/emails" element={<DevMailbox />} />
        <Route path="conta" element={<Account />} />

        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="pagamento/:id" element={<Payment />} />
          <Route path="pedido/:id" element={<OrderSuccess />} />
          <Route path="pedidos" element={<MyOrders />} />
        </Route>

        <Route path="admin" element={<AdminRoute />}>
          <Route index element={<Navigate to="pedidos" replace />} />
          <Route path="pedidos" element={<AdminOrders />} />
          <Route path="pedidos/:id" element={<AdminOrderDetail />} />
          <Route path="produtos" element={<AdminProducts />} />
          <Route path="produtos/novo" element={<AdminProductForm />} />
          <Route path="produtos/:id/editar" element={<AdminProductForm />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}