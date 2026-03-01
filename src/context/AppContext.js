"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { getSessionId } from "@/lib/session";

// localStorage keys
const LS_PREFS = "pd_preferences";
const LS_HISTORY = "pd_history";

function lsRead(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function lsWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// Supabase is an optional background sync layer.
// If it's unreachable, restricted, or tables don't exist, we silently ignore it.
// localStorage is always the source of truth.
function getSupabaseClient() {
  try {
    // Only init if env vars are present — avoids crashing during SSR/build
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    const { createClient } = require("@supabase/supabase-js");
    return createClient(url, key);
  } catch {
    return null;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [sessionId, setSessionId] = useState(null);
  const [preferences, setPreferences] = useState({});
  const [history, setHistory] = useState([]);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const sbRef = useRef(null);

  // One-time init: read localStorage immediately, then init Supabase client
  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
    setPreferences(lsRead(LS_PREFS, {}));
    setHistory(lsRead(LS_HISTORY, []));
    setPrefsLoaded(true);

    // Init Supabase client (may be null if env vars are missing or require fails)
    sbRef.current = getSupabaseClient();
  }, []);

  const setPreference = useCallback((productId, pref) => {
    const sid = getSessionId();

    setPreferences((prev) => {
      const removing = prev[productId] === pref;
      const next = { ...prev };
      if (removing) delete next[productId];
      else next[productId] = pref;

      // localStorage is primary — always write first
      lsWrite(LS_PREFS, next);

      // Background sync to Supabase (fire and forget — errors silently ignored)
      if (sbRef.current && sid) {
        if (removing) {
          sbRef.current
            .from("preferences")
            .delete()
            .eq("session_id", sid)
            .eq("product_id", productId)
            .then(() => {})
            .catch(() => {});
        } else {
          sbRef.current
            .from("preferences")
            .upsert(
              { session_id: sid, product_id: productId, preference: pref },
              { onConflict: "session_id,product_id" }
            )
            .then(() => {})
            .catch(() => {});
        }
      }

      return next;
    });
  }, []);

  const recordVisit = useCallback((product) => {
    const sid = getSessionId();
    const entry = {
      product_id: product.id,
      product_title: product.title,
      product_image: product.image,
      product_price: product.price,
      visited_at: new Date().toISOString(),
    };

    setHistory((prev) => {
      const next = [entry, ...prev];
      lsWrite(LS_HISTORY, next);

      // Background sync to Supabase
      if (sbRef.current && sid) {
        sbRef.current
          .from("browsing_history")
          .insert({ ...entry, session_id: sid })
          .then(() => {})
          .catch(() => {});
      }

      return next;
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        sessionId,
        preferences,
        prefsLoaded,
        setPreference,
        history,
        recordVisit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
