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
          <tr className="border-b border-white/5 bg-white/[0.02]">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-6 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
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
      className={`transition-colors group ${onClick ? 'cursor-pointer' : ''} ${className}`}
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
    <td colSpan={colSpan} className={`px-6 py-4 text-[13px] text-gray-300 ${className}`}>
      {children}
    </td>
  );
}
