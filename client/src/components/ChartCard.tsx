interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function ChartCard({ title, children, className = '' }: ChartCardProps) {
  return (
    <div className={`bg-surface border border-border rounded-lg p-[12px] shadow-card ${className}`}>
      <h3 className="text-[11px] font-medium text-text-secondary uppercase tracking-[0.4px] mb-3">
        {title}
      </h3>
      <div className="h-60">{children}</div>
    </div>
  );
}
