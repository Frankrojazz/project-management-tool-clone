interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={i === lines - 1 ? 'w-3/4' : 'w-full'} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function SkeletonTask() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-3">
      <Skeleton className="w-5 h-5 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton className="w-8 h-8 rounded-full" />
    </div>
  );
}

export function SkeletonProject() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="w-6 h-6 rounded" />
    </div>
  );
}
