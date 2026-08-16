export default function CoordinatorLoading() {
  return (
    <div className="flex items-center justify-center h-[50vh] w-full">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-t-transparent border-[var(--flame-red)] rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium animate-pulse">Loading dashboard data...</p>
      </div>
    </div>
  );
}
