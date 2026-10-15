const labels = ["Muito fraca", "Fraca", "Razoável", "Boa", "Forte"];
const colors = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-lime-500", "bg-green-600"];

function score(password: string) {
  let points = 0;
  if (password.length >= 8) points++;
  if (password.length >= 12) points++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) points++;
  return points; // 0 a 4
}

export default function PasswordStrength({ value }: { value: string }) {
  if (!value) return null;
  const points = score(value);

  return (
    <div className="-mt-2" aria-live="polite">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded ${i < points ? colors[points] : "bg-slate-200"}`}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-slate-500">Força da senha: {labels[points]}</p>
    </div>
  );
}