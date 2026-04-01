interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export function Table({ headers, children, className = '' }: TableProps) {
  return (
    <div className={`bg-white border border-border rounded-lg overflow-hidden shadow-card ${className}`}>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-border">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-[0.4px]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(0,0,0,0.04)]">
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
      className={`hover:bg-gray-50 transition-colors group ${onClick ? 'cursor-pointer' : ''} ${className}`}
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
    <td colSpan={colSpan} className={`px-3 py-2 text-[13px] text-gray-900 h-[38px] ${className}`}>
      {children}
    </td>
  );
}
