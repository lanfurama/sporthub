interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function ChartCard({ title, children, className = '' }: ChartCardProps) {
  return (
    <div className={`sport-card p-6 ${className}`}>
      <h3 className="text-xs font-semibold text-ink-subtle uppercase tracking-[0.12em] mb-5 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        {title}
      </h3>
      <div className="h-60">{children}</div>
    </div>
  );
}
