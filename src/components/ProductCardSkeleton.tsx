export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border bg-white">
      <div className="aspect-[3/2] bg-slate-200" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/4 rounded bg-slate-200" />
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-5 w-1/3 rounded bg-slate-200" />
      </div>
    </div>
  );
}