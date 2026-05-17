export default function SectionSkeleton({ height = "h-screen" }: { height?: string }) {
  return (
    <section className={`${height} border-t border-border bg-background`}>
      <div className="max-w-5xl mx-auto px-6 py-32 space-y-8 animate-pulse">
        <div className="h-3 w-24 rounded bg-border" />
        <div className="h-10 w-64 rounded bg-border" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-border/60" />
          ))}
        </div>
      </div>
    </section>
  );
}
