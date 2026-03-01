"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";

export default function HistoryPage() {
  const { history } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browsing History</h1>
        <p className="text-gray-500 text-sm mt-1">
          Products you've viewed — most recent first.
        </p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🕐</div>
          <p className="text-gray-500">No history yet.</p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm text-gray-900 underline"
          >
            Start browsing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry, i) => (
            <Link
              key={`${entry.product_id}-${entry.visited_at}-${i}`}
              href={`/product/${entry.product_id}`}
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              {entry.product_image && (
                <img
                  src={entry.product_image}
                  alt=""
                  className="w-12 h-12 object-contain flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {entry.product_title}
                </p>
                {entry.product_price != null && (
                  <p className="text-sm text-gray-500">${Number(entry.product_price).toFixed(2)}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {formatTime(entry.visited_at)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function formatTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
