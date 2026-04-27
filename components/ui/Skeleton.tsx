import { cn } from "@/lib/cn";

interface SkeletonProps {
  className?: string;
}

/**
 * Bloque de carga animado. Reemplaza Spinner cuando queremos sugerir la
 * forma del contenido que se va a mostrar (mejor UX que un spinner generico).
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200",
        className
      )}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton para una linea de texto.
 */
export function SkeletonLine({ width = "100%" }: { width?: string | number }) {
  return (
    <div
      className="animate-pulse rounded h-3 bg-gray-200"
      style={{ width }}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton para una card tipica con titulo + 2 lineas de subtitle.
 */
export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
      <div className="flex items-start gap-3">
        <Skeleton className="h-9 w-9 rounded-md shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonLine width="60%" />
          <SkeletonLine width="40%" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton para una grid de cards (ej. dashboard, lista de actas).
 */
export function SkeletonGrid({
  count = 6,
  cols = 3,
}: {
  count?: number;
  cols?: 2 | 3 | 4;
}) {
  const colsClass =
    cols === 2 ? "md:grid-cols-2" : cols === 3 ? "md:grid-cols-3" : "md:grid-cols-4";
  return (
    <div className={cn("grid grid-cols-1 gap-3", colsClass)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
