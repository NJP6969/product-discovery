"use client";

import { useState, useEffect, useMemo } from "react";
import { fetchProducts, fetchCategories } from "@/lib/api";
import { getTopCategories } from "@/lib/topCategories";
import { useApp } from "@/context/AppContext";
import ProductCard from "@/components/ProductCard";
import SkeletonCard from "@/components/SkeletonCard";
import SearchBar from "@/components/SearchBar";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const { preferences, prefsLoaded } = useApp();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [prods, cats] = await Promise.all([fetchProducts(), fetchCategories()]);
        if (!cancelled) {
          setProducts(prods);
          setCategories(cats);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // Smart sort: liked categories float to top
  const sortedProducts = useMemo(() => {
    if (!prefsLoaded) return products;

    // Count likes per category
    const categoryLikes = {};
    products.forEach((p) => {
      if (preferences[p.id] === "like") {
        categoryLikes[p.category] = (categoryLikes[p.category] || 0) + 1;
      }
      if (preferences[p.id] === "dislike") {
        categoryLikes[p.category] = (categoryLikes[p.category] || 0) - 0.5;
      }
    });

    return [...products].sort((a, b) => {
      const scoreA = categoryLikes[a.category] || 0;
      const scoreB = categoryLikes[b.category] || 0;
      return scoreB - scoreA;
    });
  }, [products, preferences, prefsLoaded]);

  // 1. Apply search only (before top-category narrowing)
  const searchFiltered = useMemo(() => {
    if (!search.trim()) return sortedProducts;
    const q = search.toLowerCase();
    return sortedProducts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [sortedProducts, search]);

  // 2. Compute top 2 categories from the search results
  const topCategories = useMemo(() => getTopCategories(searchFiltered), [searchFiltered]);

  // 3. Keep activeCategory in sync — reset if it falls outside the top 2
  useEffect(() => {
    if (activeCategory && !topCategories.includes(activeCategory)) {
      setActiveCategory(null);
    }
  }, [topCategories, activeCategory]);

  // 4. Final list: restrict to top 2 categories, then apply active category filter
  const filtered = useMemo(() => {
    let result = searchFiltered.filter((p) => topCategories.includes(p.category));
    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }
    return result;
  }, [searchFiltered, topCategories, activeCategory]);

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600 font-medium">Something went wrong</p>
        <p className="text-gray-500 text-sm mt-1">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Discover Products</h1>
        <p className="text-gray-500 text-sm mt-1">
          Browse, like, and explore — your preferences shape the feed.
        </p>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        categories={topCategories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No products found.</p>
          {(search || activeCategory) && (
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory(null);
              }}
              className="mt-2 text-sm text-gray-900 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
