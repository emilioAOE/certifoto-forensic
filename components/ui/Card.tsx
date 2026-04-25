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
        "rounded-lg border border-gray-200 bg-white p-4",
        onClick && "cursor-pointer hover:border-gray-300 transition-colors",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
