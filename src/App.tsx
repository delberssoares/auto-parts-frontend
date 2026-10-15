import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import Cart from "./pages/Cart";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Products />} />
        <Route path="produtos/:id" element={<ProductDetail />} />
        <Route path="*" element={<NotFound />} />
        <Route path="carrinho" element={<Cart />} />
      </Route>
    </Routes>
  );
}