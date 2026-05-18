interface BadgeProps {
  status: string;
  className?: string;
  children?: React.ReactNode;
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-status-warning-bg text-status-warning-text border-status-warning-border',
  confirmed: 'bg-status-success-bg text-status-success-text border-status-success-border',
  cancelled: 'bg-status-danger-bg text-status-danger-text border-status-danger-border',
  completed: 'bg-status-info-bg text-status-info-text border-status-info-border',
  rejected:  'bg-status-danger-bg text-status-danger-text border-status-danger-border',
  active:    'bg-status-success-bg text-status-success-text border-status-success-border',
  inactive:  'bg-surface-muted text-ink-subtle border-border',
  basic:     'bg-surface-muted text-ink-muted border-border',
  prime:     'bg-info-subtle text-info border-info/30',
  vip:       'bg-primary-subtle text-primary border-primary/30',
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
  const style = STATUS_STYLES[normalizedStatus] ?? 'bg-surface-muted text-ink-subtle border-border';
  const label = children ?? (STATUS_LABELS[normalizedStatus] ?? status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${style} ${className}`}
    >
      {label}
    </span>
  );
}
