"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Canvas, CanvasThread, CanvasWithThreads, CanvasStatus, MeshCount } from "@/lib/types";

const MESH_OPTIONS: { value: MeshCount; label: string }[] = [
  { value: "13", label: "13" },
  { value: "18", label: "18" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS: { value: CanvasStatus; label: string }[] = [
  { value: "wishlist", label: "Wishlist" },
  { value: "in stash", label: "In stash" },
  { value: "WIP", label: "WIP" },
  { value: "to finish", label: "To finish" },
  { value: "complete", label: "Complete" },
];

function getStatusBadgeClass(status: CanvasStatus): string {
  switch (status) {
    case "WIP":
      return "badge-navy";
    case "complete":
      return "badge-teal";
    case "in stash":
      return "badge-sand";
    default:
      return "badge-muted";
  }
}

interface ThreadInput {
  brand: string;
  color_number: string;
  color_name: string;
  lot_number: string;
  quantity: string;
}

const emptyThread = (): ThreadInput => ({
  brand: "",
  color_number: "",
  color_name: "",
  lot_number: "",
  quantity: "1",
});

export default function StashPage() {
  const [canvases, setCanvases] = useState<CanvasWithThreads[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [designer, setDesigner] = useState("");
  const [retailer, setRetailer] = useState("");
  const [meshCount, setMeshCount] = useState<MeshCount | "">("");
  const [status, setStatus] = useState<CanvasStatus>("in stash");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [threads, setThreads] = useState<ThreadInput[]>([emptyThread()]);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  async function loadCanvases() {
    setLoading(true);
    setError(null);
    const { data: canvasesData, error: canvasesError } = await supabase
      .from("canvases")
      .select("*")
      .order("created_at", { ascending: false });

    if (canvasesError) {
      setError(canvasesError.message);
      setCanvases([]);
      setLoading(false);
      return;
    }

    const withThreads: CanvasWithThreads[] = await Promise.all(
      (canvasesData || []).map(async (c) => {
        const { data: threadsData } = await supabase
          .from("canvas_threads")
          .select("*")
          .eq("canvas_id", c.id)
          .order("created_at", { ascending: true });
        return {
          ...c,
          tags: Array.isArray(c.tags) ? c.tags : [],
          threads: threadsData || [],
        };
      })
    );
    setCanvases(withThreads);
    setLoading(false);
  }

  useEffect(() => {
    loadCanvases();
  }, []);

  function addThreadRow() {
    setThreads((t) => [...t, emptyThread()]);
  }

  function removeThreadRow(i: number) {
    setThreads((t) => t.filter((_, idx) => idx !== i));
  }

  function updateThread(i: number, field: keyof ThreadInput, value: string) {
    setThreads((t) => {
      const next = [...t];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) {
      setTags((prev) => [...prev, t]);
      setTagInput("");
    }
  }

  function removeTag(i: number) {
    setTags((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleTagInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  async function handleDeleteCanvas(canvasId: string) {
    if (!confirm("Delete this canvas?")) return;
    setError(null);
    const { error } = await supabase.from("canvases").delete().eq("id", canvasId);
    if (error) {
      setError(error.message);
      return;
    }
    setCanvases((prev) => prev.filter((c) => c.id !== canvasId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { data: canvasRow, error: insertCanvasError } = await supabase
      .from("canvases")
      .insert({
        name: name.trim() || "Untitled canvas",
        designer: designer.trim() || null,
        retailer: retailer.trim() || null,
        mesh_count: meshCount || null,
        status,
        notes: notes.trim() || null,
        tags: tags.length > 0 ? tags : [],
      })
      .select("id")
      .single();

    if (insertCanvasError || !canvasRow) {
      setError(insertCanvasError?.message ?? "Failed to create canvas");
      setSubmitting(false);
      return;
    }

    const toInsert = threads.filter(
      (t) => t.brand.trim() || t.color_number.trim() || t.color_name.trim()
    );
    if (toInsert.length > 0) {
      const { error: threadsError } = await supabase.from("canvas_threads").insert(
        toInsert.map((t) => ({
          canvas_id: canvasRow.id,
          brand: t.brand.trim() || null,
          color_number: t.color_number.trim() || null,
          color_name: t.color_name.trim() || null,
          lot_number: t.lot_number.trim() || null,
          quantity: parseInt(t.quantity, 10) || 1,
        }))
      );
      if (threadsError) setError(threadsError.message);
    }

    setSubmitting(false);
    if (!insertCanvasError) {
      setName("");
      setDesigner("");
      setRetailer("");
      setMeshCount("");
      setStatus("in stash");
      setNotes("");
      setTags([]);
      setTagInput("");
      setThreads([emptyThread()]);
      loadCanvases();
    }
  }

  const uniqueTags = Array.from(
    new Set(canvases.flatMap((c) => c.tags || []))
  ).sort();
  const filteredCanvases =
    filterTag == null
      ? canvases
      : canvases.filter((c) => (c.tags || []).includes(filterTag));

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="font-serif text-lg tracking-wide text-navy hover:text-foreground"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            ← Needlepointer
          </Link>
          <h1
            className="text-2xl font-semibold text-foreground sm:text-3xl"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            Canvas stash
          </h1>
          <div className="w-24" aria-hidden />
        </header>

        <section className="canvas-mesh rounded-2xl border border-ocean-mist bg-sea-glass/80 p-6 shadow-sm sm:p-8">
          <h2
            className="mb-6 text-xl font-semibold text-foreground"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            Add a canvas
          </h2>

          {error && (
            <p className="mb-4 rounded-lg bg-ocean-mist/40 px-4 py-2 text-sm text-foreground">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-text-muted">
                  Canvas name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-ocean-mist bg-sea-glass px-3 py-2 text-foreground placeholder:text-text-muted focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  placeholder="e.g. Holiday Stocking"
                />
              </div>
              <div>
                <label htmlFor="designer" className="mb-1 block text-sm font-medium text-text-muted">
                  Designer
                </label>
                <input
                  id="designer"
                  type="text"
                  value={designer}
                  onChange={(e) => setDesigner(e.target.value)}
                  className="w-full rounded-lg border border-ocean-mist bg-sea-glass px-3 py-2 text-foreground placeholder:text-text-muted focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  placeholder="e.g. Melissa Shirley"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="retailer" className="mb-1 block text-sm font-medium text-text-muted">
                  Retailer
                </label>
                <input
                  id="retailer"
                  type="text"
                  value={retailer}
                  onChange={(e) => setRetailer(e.target.value)}
                  className="w-full rounded-lg border border-ocean-mist bg-sea-glass px-3 py-2 text-foreground placeholder:text-text-muted focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                  placeholder="e.g. Needlepoint Inc."
                />
              </div>
              <div>
                <label htmlFor="mesh_count" className="mb-1 block text-sm font-medium text-text-muted">
                  Mesh count
                </label>
                <select
                  id="mesh_count"
                  value={meshCount}
                  onChange={(e) => setMeshCount((e.target.value as MeshCount) || "")}
                  className="w-full rounded-lg border border-ocean-mist bg-sea-glass px-3 py-2 text-foreground focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                >
                  <option value="">Select</option>
                  {MESH_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="status" className="mb-1 block text-sm font-medium text-text-muted">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as CanvasStatus)}
                className="w-full rounded-lg border border-ocean-mist bg-sea-glass px-3 py-2 text-foreground focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy sm:max-w-xs"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tags" className="mb-1 block text-sm font-medium text-text-muted">
                Tags
              </label>
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-ocean-mist bg-sea-glass px-3 py-2 focus-within:border-navy focus-within:ring-1 focus-within:ring-navy">
                {tags.map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="btn-teal-solid inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(i)}
                      className="rounded-full p-0.5 hover:bg-teal/80 focus:outline-none focus:ring-2 focus:ring-navy"
                      aria-label={`Remove tag ${t}`}
                    >
                      <span className="sr-only">Remove</span>
                      <span aria-hidden>×</span>
                    </button>
                  </span>
                ))}
                <input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  onBlur={addTag}
                  placeholder="Type a tag, press Enter or comma"
                  className="min-w-[140px] flex-1 border-0 bg-transparent px-0 py-0.5 text-foreground placeholder:text-text-muted focus:ring-0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="mb-1 block text-sm font-medium text-text-muted">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-ocean-mist bg-sea-glass px-3 py-2 text-foreground placeholder:text-text-muted focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy"
                placeholder="Any notes about this canvas..."
              />
            </div>

            <div className="border-t border-ocean-mist pt-6">
              <div className="mb-3 flex items-center justify-between">
                <span
                  className="text-sm font-medium text-foreground"
                  style={{ fontFamily: "var(--font-cormorant), serif" }}
                >
                  Threads
                </span>
                <button
                  type="button"
                  onClick={addThreadRow}
                  className="text-sm font-medium text-navy hover:text-teal focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2 focus:ring-offset-sea-glass"
                >
                  + Add thread
                </button>
              </div>
              <div className="space-y-4">
                {threads.map((t, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-ocean-mist/80 bg-sea-glass/80 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                        Thread {i + 1}
                      </span>
                      {threads.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeThreadRow(i)}
                          className="text-xs text-text-muted hover:text-foreground"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        value={t.brand}
                        onChange={(e) => updateThread(i, "brand", e.target.value)}
                        placeholder="Brand"
                        className="rounded border border-ocean-mist bg-white px-2 py-1.5 text-sm text-foreground placeholder:text-text-muted focus:border-navy focus:outline-none"
                      />
                      <input
                        type="text"
                        value={t.color_number}
                        onChange={(e) => updateThread(i, "color_number", e.target.value)}
                        placeholder="Color number"
                        className="rounded border border-ocean-mist bg-white px-2 py-1.5 text-sm text-foreground placeholder:text-text-muted focus:border-navy focus:outline-none"
                      />
                      <input
                        type="text"
                        value={t.color_name}
                        onChange={(e) => updateThread(i, "color_name", e.target.value)}
                        placeholder="Color name"
                        className="rounded border border-ocean-mist bg-white px-2 py-1.5 text-sm text-foreground placeholder:text-text-muted focus:border-navy focus:outline-none sm:col-span-2"
                      />
                      <input
                        type="text"
                        value={t.lot_number}
                        onChange={(e) => updateThread(i, "lot_number", e.target.value)}
                        placeholder="Lot number"
                        className="rounded border border-ocean-mist bg-white px-2 py-1.5 text-sm text-foreground placeholder:text-text-muted focus:border-navy focus:outline-none"
                      />
                      <input
                        type="number"
                        min={1}
                        value={t.quantity}
                        onChange={(e) => updateThread(i, "quantity", e.target.value)}
                        placeholder="Qty"
                        className="rounded border border-ocean-mist bg-white px-2 py-1.5 text-sm text-foreground placeholder:text-text-muted focus:border-navy focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full rounded-xl px-6 py-3 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2 focus:ring-offset-background disabled:opacity-60 sm:w-auto sm:min-w-[180px]"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              {submitting ? "Adding…" : "Add to stash"}
            </button>
          </form>
        </section>

        <section className="mt-12">
          <h2
            className="mb-4 text-xl font-semibold text-foreground"
            style={{ fontFamily: "var(--font-cormorant), serif" }}
          >
            Your canvases
          </h2>

          {uniqueTags.length > 0 && (
            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-text-muted">
                Filter by tag
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFilterTag(null)}
                  className={`filter-pill rounded-full px-3 py-1 text-sm ${
                    filterTag === null ? "btn-teal-solid" : "bg-ocean-mist text-foreground"
                  }`}
                >
                  All
                </button>
                {uniqueTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                    className={`filter-pill rounded-full px-3 py-1 text-sm ${
                      filterTag === tag ? "btn-teal-solid" : "bg-ocean-mist text-foreground"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <p className="text-text-muted">Loading…</p>
          ) : canvases.length === 0 ? (
            <p className="rounded-2xl border border-ocean-mist bg-sea-glass/50 px-6 py-8 text-center text-text-muted">
              No canvases yet. Add one above to get started.
            </p>
          ) : filteredCanvases.length === 0 ? (
            <p className="rounded-2xl border border-ocean-mist bg-sea-glass/50 px-6 py-8 text-center text-text-muted">
              No canvases with tag &quot;{filterTag}&quot;. Clear filter to see all.
            </p>
          ) : (
            <ul className="space-y-6">
              {filteredCanvases.map((canvas) => (
                <li
                  key={canvas.id}
                  className="canvas-mesh rounded-2xl border border-ocean-mist bg-sea-glass/80 p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3
                        className="text-lg font-semibold text-foreground"
                        style={{ fontFamily: "var(--font-cormorant), serif" }}
                      >
                        {canvas.name}
                      </h3>
                      {(canvas.designer || canvas.retailer) && (
                        <p className="mt-1 text-sm text-text-muted">
                          {[canvas.designer, canvas.retailer].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(canvas.status)}`}>
                        {canvas.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteCanvas(canvas.id)}
                        className="rounded p-1 text-text-muted hover:bg-ocean-mist/50 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-1"
                        aria-label={`Delete ${canvas.name}`}
                        title="Delete canvas"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-text-muted">
                    {canvas.mesh_count && (
                      <span>Mesh: {canvas.mesh_count}</span>
                    )}
                  </div>
                  {(canvas.tags?.length ?? 0) > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {canvas.tags!.map((tag) => (
                        <span
                          key={tag}
                          className="btn-teal-solid inline-flex rounded-full px-2.5 py-0.5 text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {canvas.notes && (
                    <p className="mt-2 text-sm text-text-muted">{canvas.notes}</p>
                  )}
                  {canvas.threads.length > 0 && (
                    <div className="mt-4 border-t border-ocean-mist pt-4">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                        Threads
                      </p>
                      <ul className="space-y-1 text-sm text-foreground">
                        {canvas.threads.map((th) => {
                          const parts = [th.brand, th.color_number, th.color_name].filter(Boolean);
                          if (th.lot_number?.trim()) parts.push(`Lot #${th.lot_number.trim()}`);
                          const line = parts.join(" — ");
                          return (
                            <li key={th.id}>
                              {line}
                              {th.quantity > 1 && ` x${th.quantity}`}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
