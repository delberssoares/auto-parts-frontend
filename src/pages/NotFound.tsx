import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-slate-500">Página não encontrada.</p>
      <Link to="/" className="mt-6 inline-block text-blue-700 underline">Voltar para a loja</Link>
    </div>
  );
}