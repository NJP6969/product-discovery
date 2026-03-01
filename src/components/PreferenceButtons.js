"use client";

import { useApp } from "@/context/AppContext";

export default function PreferenceButtons({ productId }) {
  const { preferences, setPreference } = useApp();
  const current = preferences[productId];

  return (
    <div className="flex gap-2">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPreference(productId, "like");
        }}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          current === "like"
            ? "bg-green-100 text-green-700 ring-1 ring-green-300"
            : "bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600"
        }`}
        title="Like"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
        </svg>
        Like
      </button>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPreference(productId, "dislike");
        }}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          current === "dislike"
            ? "bg-red-100 text-red-700 ring-1 ring-red-300"
            : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600"
        }`}
        title="Dislike"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10zM17 2h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
        </svg>
        Dislike
      </button>
    </div>
  );
}
