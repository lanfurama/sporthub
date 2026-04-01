interface BadgeProps {
  status: string;
  className?: string;
  children?: React.ReactNode;
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-status-warning-bg text-status-warning-text border-status-warning-border',
  confirmed: 'bg-status-success-bg text-status-success-text border-status-success-border shadow-[0_0_10px_rgba(16,185,129,0.1)]',
  cancelled: 'bg-status-danger-bg text-status-danger-text border-status-danger-border',
  completed: 'bg-status-info-bg text-status-info-text border-status-info-border shadow-[0_0_10px_rgba(59,130,246,0.1)]',
  rejected:  'bg-status-danger-bg text-status-danger-text border-status-danger-border',
  active:    'bg-status-success-bg text-status-success-text border-status-success-border',
  inactive:  'bg-white/5 text-gray-500 border-white/5',
  basic:     'bg-white/5 text-gray-400 border-white/10',
  prime:     'bg-secondary/10 text-secondary border-secondary/20 shadow-[0_0_10px_rgba(0,229,255,0.1)]',
  vip:       'bg-primary/10 text-primary border-primary/20 shadow-neon',
};

const STATUS_LABELS: Record<string, string> = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  rejected:  'Rejected',
  active:    'Active',
  inactive:  'Inactive',
};

export default function Badge({ status, children, className = '' }: BadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const style = STATUS_STYLES[normalizedStatus] ?? 'bg-white/5 text-gray-500 border-white/5';
  const label = children ?? (STATUS_LABELS[normalizedStatus] ?? status);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all duration-300 ${style} ${className}`}
    >
      {label}
    </span>
  );
}
