
import { Skeleton } from "@/components/ui/skeleton";

export const TableSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-[250px]" />
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  </div>
);
