const RouteFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center py-16">
    <div className="flex flex-col items-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
      <p className="text-body-sm text-neutral-500">Loading...</p>
    </div>
  </div>
);

export const SectionFallback = () => (
  <div className="flex items-center justify-center py-16">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
  </div>
);

export default RouteFallback;
