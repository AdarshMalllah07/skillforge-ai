/** Lightweight route fallback — keep shell stable, avoid heavy flash */
export default function Loading() {
  return (
    <div className="py-2 space-y-4 animate-pulse" aria-busy="true" aria-label="Loading">
      <div className="h-20 rounded-2xl bg-sf-surface-2/80 border border-sf" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-sf-surface-2/60 border border-sf" />
        ))}
      </div>
      <div className="h-48 rounded-2xl bg-sf-surface-2/50 border border-sf" />
    </div>
  );
}
