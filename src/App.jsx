import React, { useEffect, useMemo, useState } from "react";

// FrustrationList — Preview-first version (NO external packages)
// This file runs cleanly in Vite + React.
//
// What this gives you:
// - Top this week
// - Browse
// - Submit
// - Admin (local preview only)
// - No backend yet (we’ll add Supabase later)

const TAGLINE = "A public list of the problems nobody fixes.";

const DEFAULT_CATEGORIES = [
  "Work",
  "Money",
  "Health",
  "Family",
  "Tech",
  "Home",
  "Travel",
  "Other",
];

const DEFAULT_IMPACTS = [
  { value: "1", label: "1 (Mild)" },
  { value: "3", label: "3" },
  { value: "5", label: "5" },
  { value: "7", label: "7" },
  { value: "10", label: "10 (Raging)" },
];

const SEED_FRUSTRATIONS = [
  { text: "Customer support is hidden behind bots.", category: "Tech", impact: 7 },
  { text: "Canceling services is intentionally harder than signing up.", category: "Money", impact: 7 },
  { text: "Doctor offices rarely answer the phone.", category: "Health", impact: 7 },
  { text: "I spend more time in meetings than doing real work.", category: "Work", impact: 7 },
  { text: "Everything requires an account now.", category: "Other", impact: 5 },
  { text: "Prices change without explanation.", category: "Money", impact: 5 },
  { text: "Medical bills arrive months later.", category: "Health", impact: 7 },
  { text: "Unlimited PTO still makes people afraid to take time off.", category: "Work", impact: 5 },
];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function formatDate(iso) {
  return new Date(iso).toLocaleString();
}

export default function App() {
  const [activeTab, setActiveTab] = useState("Top");
  const [toast, setToast] = useState(null);

  const [publishedItems, setPublishedItems] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);

  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const [text, setText] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [impact, setImpact] = useState("5");

  useEffect(() => {
    const seeded = SEED_FRUSTRATIONS.map((s, i) => ({
      id: uid(),
      text: s.text,
      category: s.category,
      impact: s.impact,
      created_at: new Date(Date.now() - i * 3600_000).toISOString(),
    }));
    setPublishedItems(seeded);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    return publishedItems
      .filter((i) => (filter === "All" ? true : i.category === filter))
      .filter((i) =>
        query ? i.text.toLowerCase().includes(query.toLowerCase()) : true
      );
  }, [publishedItems, filter, query]);

  function submitFrustration(e) {
    e.preventDefault();
    if (text.trim().length < 8) {
      setToast("Please write a bit more.");
      return;
    }

    setPendingItems((p) => [
      {
        id: uid(),
        text,
        category,
        impact: Number(impact),
        created_at: new Date().toISOString(),
      },
      ...p,
    ]);

    setText("");
    setToast("Submitted. Pending review.");
    setActiveTab("Admin");
  }

  function publish(id) {
    const item = pendingItems.find((p) => p.id === id);
    if (!item) return;
    setPendingItems((p) => p.filter((x) => x.id !== id));
    setPublishedItems((a) => [item, ...a]);
    setToast("Published.");
  }

  function reject(id) {
    setPendingItems((p) => p.filter((x) => x.id !== id));
    setToast("Rejected.");
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-3xl font-bold">FrustrationList</h1>
        <p className="mt-1 text-sm text-zinc-600">{TAGLINE}</p>

        <div className="mt-6 flex gap-2">
          {["Top", "Browse", "Submit", "Admin"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                activeTab === t
                  ? "bg-zinc-900 text-white"
                  : "bg-white border"
              }`}
            >
              {t === "Top" ? "Top this week" : t}
            </button>
          ))}
        </div>

        <main className="mt-6 space-y-4">
          {activeTab === "Browse" && (
            <div className="bg-white p-4 rounded-xl border space-y-3">
              <div className="flex gap-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  <option value="All">All</option>
                  {DEFAULT_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search"
                  className="border rounded px-2 py-1 flex-1"
                />
              </div>

              {filtered.map((i) => (
                <div key={i.id} className="border rounded p-3">
                  <div className="text-xs text-zinc-500">
                    {i.category} • Impact {i.impact}/10 •{" "}
                    {formatDate(i.created_at)}
                  </div>
                  <p className="mt-1">{i.text}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Submit" && (
            <form
              onSubmit={submitFrustration}
              className="bg-white p-4 rounded-xl border space-y-3"
            >
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full border rounded p-2"
                placeholder="What’s frustrating you?"
              />
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  {DEFAULT_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <select
                  value={impact}
                  onChange={(e) => setImpact(e.target.value)}
                  className="border rounded px-2 py-1"
                >
                  {DEFAULT_IMPACTS.map((i) => (
                    <option key={i.value} value={i.value}>
                      {i.label}
                    </option>
                  ))}
                </select>
              </div>
              <button className="bg-zinc-900 text-white px-4 py-2 rounded">
                Submit
              </button>
            </form>
          )}

          {activeTab === "Admin" && (
            <div className="space-y-3">
              {pendingItems.map((p) => (
                <div key={p.id} className="bg-white p-4 rounded-xl border">
                  <p>{p.text}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => publish(p.id)}
                      className="bg-zinc-900 text-white px-3 py-1 rounded"
                    >
                      Publish
                    </button>
                    <button
                      onClick={() => reject(p.id)}
                      className="border px-3 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
              {pendingItems.length === 0 && (
                <p className="text-sm text-zinc-500">No pending items.</p>
              )}
            </div>
          )}

          {activeTab === "Top" && (
            <div className="bg-white p-4 rounded-xl border">
              {publishedItems.map((i) => (
                <p key={i.id} className="border-b py-2 last:border-none">
                  {i.text}
                </p>
              ))}
            </div>
          )}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-4 py-2 rounded-full">
          {toast}
        </div>
      )}
    </div>
  );
}
