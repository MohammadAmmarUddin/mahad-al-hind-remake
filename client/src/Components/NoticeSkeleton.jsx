const NoticeSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-emerald-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="h-5 w-16 rounded-full bg-emerald-100" />
            <div className="h-5 w-12 rounded-full bg-slate-100" />
          </div>
          <div className="mb-2 h-5 w-3/4 rounded bg-slate-200" />
          <div className="mb-1 h-3 w-full rounded bg-slate-100" />
          <div className="mb-4 h-3 w-2/3 rounded bg-slate-100" />
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-slate-100" />
            <div className="h-3 w-16 rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NoticeSkeleton;
