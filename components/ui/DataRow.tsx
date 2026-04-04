interface DataRowProps {
  label: string;
  value: string | number | null | undefined;
  mono?: boolean;
}

export function DataRow({ label, value, mono }: DataRowProps) {
  const display = value === null || value === undefined || value === "" ? "—" : String(value);
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-surface-200 last:border-0">
      <span className="text-muted text-sm shrink-0">{label}</span>
      <span
        className={`text-sm text-right break-all ${
          mono ? "font-mono text-accent/80" : "text-gray-200"
        }`}
      >
        {display}
      </span>
    </div>
  );
}
