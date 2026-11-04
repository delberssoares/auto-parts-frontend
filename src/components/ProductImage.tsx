import { useState } from "react";
import { categoryIcon } from "../lib/categoryIcon";
import type { Product } from "../types";

const isPlaceholder = (url: string) => !url || url.includes("placehold.co");

interface Props {
  product: Product;
  categoryName?: string;
  className?: string;
}

export default function ProductImage({ product, categoryName, className = "" }: Props) {
  const [failed, setFailed] = useState(false);

  if (isPlaceholder(product.image_url) || failed) {
    const Icon = categoryIcon(categoryName);
    return (
      <div className={`blueprint-light grid aspect-[4/3] place-items-center bg-garage-50 text-garage-700 ${className}`}>
        <Icon className="h-14 w-14 opacity-60 sm:h-16 sm:w-16" strokeWidth={1.4} />
      </div>
    );
  }

  return (
    <div className={`aspect-[4/3] overflow-hidden bg-garage-50 ${className}`}>
      <img
        src={product.image_url}
        alt={product.name}
        loading="lazy"
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}