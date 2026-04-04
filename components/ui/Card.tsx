import { cn } from "@/lib/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-surface-300 bg-surface-100 p-4",
        onClick && "cursor-pointer hover:border-surface-400 transition-colors",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
