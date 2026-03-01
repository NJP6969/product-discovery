"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchProduct } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import PreferenceButtons from "@/components/PreferenceButtons";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { recordVisit, prefsLoaded } = useApp();
  // Tracks which productId has already been recorded this session.
  // A ref (not state) avoids triggering extra re-renders.
  const recordedIdRef = useRef(null);

  // Reset state when navigating between different products.
  useEffect(() => {
    setProduct(null);
    setLoading(true);
    setError(null);
  }, [id]);

  // Fetch the product for this id.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchProduct(id);
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [id]);

  // Record the visit once both the product is loaded and localStorage is ready.
  // prefsLoaded is true as soon as the localStorage read completes (synchronous on mount).
  useEffect(() => {
    if (product && prefsLoaded && recordedIdRef.current !== product.id) {
      recordedIdRef.current = product.id;
      recordVisit(product);
    }
  }, [product, prefsLoaded, recordVisit]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-gray-200 rounded-lg h-96" />
          <div className="space-y-4">
            <div className="h-3 bg-gray-200 rounded w-1/4" />
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 font-medium">Could not load product</p>
        <p className="text-gray-500 text-sm mt-1">{error}</p>
        <Link
          href="/"
          className="mt-4 inline-block px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
        >
          Back to feed
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to browse
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-96 object-contain"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-5">
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              {product.category}
            </span>
            <h1 className="text-xl font-bold text-gray-900 mt-1">{product.title}</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {product.rating && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {product.rating.rate} ({product.rating.count} reviews)
              </div>
            )}
          </div>

          <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

          <PreferenceButtons productId={product.id} />

          <a
            href="https://fakestoreapi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Visit Product
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
