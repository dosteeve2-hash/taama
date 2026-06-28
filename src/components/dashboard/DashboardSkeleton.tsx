// Skeleton de chargement pour le dashboard
export function SkeletonBlock({
  className = '',
  style = {},
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`animate-shimmer rounded-lg ${className}`}
      style={{ minHeight: 16, ...style }}
    />
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex flex-col gap-2">
        <SkeletonBlock style={{ width: 180, height: 28 }} />
        <SkeletonBlock style={{ width: 240, height: 16 }} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="taama-card p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <SkeletonBlock style={{ width: 36, height: 36, borderRadius: 12 }} />
            </div>
            <div className="flex flex-col gap-2">
              <SkeletonBlock style={{ width: 64, height: 24 }} />
              <SkeletonBlock style={{ width: 96, height: 14 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Graphique production */}
      <div className="taama-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <SkeletonBlock style={{ width: 200, height: 20 }} />
          <SkeletonBlock style={{ width: 64, height: 24, borderRadius: 8 }} />
        </div>
        <SkeletonBlock style={{ height: 208, borderRadius: 8 }} />
      </div>

      {/* Graphique stock */}
      <div className="taama-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <SkeletonBlock style={{ width: 220, height: 20 }} />
          <SkeletonBlock style={{ width: 64, height: 24, borderRadius: 8 }} />
        </div>
        <SkeletonBlock style={{ height: 208, borderRadius: 8 }} />
      </div>

      {/* Tableau lots */}
      <div className="taama-card overflow-hidden">
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <SkeletonBlock style={{ width: 120, height: 20 }} />
          <SkeletonBlock style={{ width: 60, height: 16 }} />
        </div>
        <div className="px-6 py-4 flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <SkeletonBlock style={{ width: 80, height: 14 }} />
              <SkeletonBlock style={{ width: 60, height: 22, borderRadius: 8 }} />
              <SkeletonBlock style={{ width: 70, height: 14 }} />
              <SkeletonBlock style={{ width: 70, height: 14 }} />
              <SkeletonBlock style={{ width: 40, height: 14 }} />
              <SkeletonBlock style={{ width: 50, height: 14 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
