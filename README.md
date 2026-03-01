# Product Discovery

A product discovery web app built for the Beespoke R1 Build Challenge (Track B). Browse products from FakeStoreAPI, like or dislike them, view details, and track your browsing history — all persisted to Supabase.

## Live Demo

_[Add deployed link here]_

## Approach

This is a straightforward Next.js app that does three things well:

1. **Product Feed** — Fetches all products from FakeStoreAPI and displays them in a responsive grid. Search and category filters let you narrow down what you're looking for.

2. **Like / Dislike** — Every product card has like/dislike buttons. Tapping the same button again removes the preference. Preferences are stored in Supabase, so they survive browser clears, not just page reloads.

3. **Product Detail + History** — Clicking a card opens the full product page with description, rating, price, and a "Visit Product" link. Every detail page view is recorded in browsing history, viewable from the History tab.

**Bonus**: Products from liked categories automatically float to the top of the feed — a lightweight recommendation without over-engineering it.

## State Management

**React Context** with two pieces of state:

- `preferences` — a `{ productId: 'like' | 'dislike' }` map, loaded from Supabase on mount
- `history` — an array of visited products, loaded from Supabase on mount

No Redux, no Zustand. The state shape is simple enough that Context + `useState` covers it. Updates are optimistic: the UI updates immediately, then the DB write happens in the background.

## Data Persistence

**localStorage is the primary store.** Preferences (like/dislike) and browsing history are written to `localStorage` on every change and read back immediately on page load — no network required.

| Key | Contents |
|-----|---------|
| `pd_session_id` | Anonymous UUID that identifies this browser |
| `pd_preferences` | `{ [productId]: 'like' | 'dislike' }` map |
| `pd_history` | Array of visited products with timestamps |

**Supabase (PostgreSQL)** is wired up as an optional background sync layer. After each localStorage write succeeds, a fire-and-forget request is sent to Supabase. If the request fails (network restricted, tables not yet created, cold start), it is silently ignored — the app keeps working from localStorage. To enable Supabase sync, run `supabase-schema.sql` in the Supabase SQL Editor.

## Architecture Decisions

- **Next.js App Router** — File-based routing, server components by default, and built-in optimizations. Pages that need interactivity (all of them here) use `"use client"`.
- **Tailwind CSS** — Fast utility-first styling. No custom CSS files, no class naming debates.
- **No auth** — The assignment doesn't need it. An anonymous UUID keeps things simple while still being tied to Supabase rows.
- **Optimistic updates** — Like/dislike feels instant. The DB write is fire-and-forget for the UI.
- **Cancellation in effects** — All data-fetching effects use a `cancelled` flag to prevent state updates after unmount.

## What I'd Improve With More Time

- **Auth** — Replace anonymous sessions with proper login (Supabase Auth is already set up). This would let preferences sync across devices.
- **Infinite scroll / pagination** — FakeStoreAPI only has 20 products, but real feeds would need this.
- **Better recommendations** — Currently just category-level scoring. Could incorporate price range preferences, rating thresholds, collaborative filtering.
- **Animations** — Framer Motion for card transitions, like/dislike feedback, page navigation.
- **Testing** — Unit tests for context logic, integration tests for the Supabase interaction.
- **Error boundaries** — React error boundaries for more granular error recovery.

## Setup

```bash
# Install dependencies
npm install

# Create a .env.local file with your Supabase credentials
# (already provided — see .env.local)

# Run the Supabase schema (copy supabase-schema.sql into Supabase SQL editor)

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Tailwind CSS 4
- Supabase (PostgreSQL)
- FakeStoreAPI
