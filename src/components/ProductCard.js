"use client";

import Link from "next/link";
import PreferenceButtons from "./PreferenceButtons";

export default function ProductCard({ product }) {
  return (
    <div className="group bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <Link href={`/product/${product.id}`} className="flex-1 flex flex-col">
        <div className="relative bg-gray-50 p-6 flex items-center justify-center h-52">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
          />
        </div>
        <div className="p-4 flex-1 flex flex-col gap-2">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            {product.category}
          </span>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
            {product.title}
          </h3>
          <div className="mt-auto pt-2 flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-500">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {product.rating?.rate ?? "–"}
            </div>
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <PreferenceButtons productId={product.id} />
      </div>
    </div>
  );
}
