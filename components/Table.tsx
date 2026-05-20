interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export function Table({ headers, children, className = '' }: TableProps) {
  return (
    <div className={`bg-transparent overflow-hidden ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border bg-surface-muted">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-6 py-3.5 text-left text-[11px] font-semibold text-ink-subtle uppercase tracking-[0.12em]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {children}
        </tbody>
      </table>
    </div>
  );
}

interface TableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function TableRow({ children, onClick, className = '' }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors hover:bg-surface-muted/50 group ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </tr>
  );
}

interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export function TableCell({ children, className = '', colSpan }: TableCellProps) {
  return (
    <td colSpan={colSpan} className={`px-6 py-4 text-sm text-ink ${className}`}>
      {children}
    </td>
  );
}
