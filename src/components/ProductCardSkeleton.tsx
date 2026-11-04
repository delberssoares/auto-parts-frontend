export default function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-white" aria-hidden="true">
      <div className="aspect-[4/3] animate-pulse bg-garage-50" />
      <div className="space-y-2.5 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-garage-100" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-garage-100" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-garage-100" />
        <div className="flex items-end justify-between pt-3">
          <div className="h-6 w-1/3 animate-pulse rounded bg-garage-100" />
          <div className="h-11 w-11 animate-pulse rounded-md bg-garage-100" />
        </div>
      </div>
    </div>
  );
}