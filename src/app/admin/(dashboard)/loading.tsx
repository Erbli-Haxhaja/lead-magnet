export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      {/* Page header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-48 bg-white/5 rounded-lg" />
          <div className="h-4 w-72 bg-white/5 rounded-lg mt-2" />
        </div>
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="h-7 w-10 bg-white/5 rounded mx-auto" />
            <div className="h-3 w-14 bg-white/5 rounded mt-1 mx-auto" />
          </div>
          <div className="text-center">
            <div className="h-7 w-10 bg-white/5 rounded mx-auto" />
            <div className="h-3 w-14 bg-white/5 rounded mt-1 mx-auto" />
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-htd-card border border-htd-card-border rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-htd-card-border">
          <div className="h-4 w-32 bg-white/5 rounded" />
          <div className="h-4 w-24 bg-white/5 rounded" />
          <div className="h-4 w-20 bg-white/5 rounded" />
          <div className="h-4 w-16 bg-white/5 rounded" />
          <div className="flex-1" />
          <div className="h-4 w-20 bg-white/5 rounded" />
        </div>

        {/* Table rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-6 py-4 border-b border-htd-card-border last:border-b-0"
          >
            <div className="h-4 w-40 bg-white/[0.03] rounded" />
            <div className="h-5 w-20 bg-white/[0.03] rounded-full" />
            <div className="h-4 w-28 bg-white/[0.03] rounded" />
            <div className="h-4 w-20 bg-white/[0.03] rounded" />
            <div className="flex-1" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-white/[0.03] rounded" />
              <div className="h-8 w-8 bg-white/[0.03] rounded" />
              <div className="h-8 w-8 bg-white/[0.03] rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
