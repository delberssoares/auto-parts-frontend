import type { ReactNode } from "react";

interface Props {
  label: string;
  error?: string;
  children: ReactNode;
}

export default function FormField({ label, error, children }: Props) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
}