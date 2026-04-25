interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ icon, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-accent">{icon}</span>
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
        {title}
      </h3>
      {subtitle && (
        <span className="text-xs text-muted ml-auto">{subtitle}</span>
      )}
    </div>
  );
}
