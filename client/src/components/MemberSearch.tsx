import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { membersApi } from '../api/members';
import type { Member } from '../types';
import Spinner from './Spinner';

interface MemberSearchProps {
  onSelect: (member: Member | null) => void;
  selectedMember?: Member | null;
  placeholder?: string;
}

export default function MemberSearch({ onSelect, selectedMember, placeholder = 'Tìm thành viên...' }: MemberSearchProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: members, isLoading } = useQuery({
    queryKey: ['members', 'search', search],
    queryFn: () => membersApi.list({ search, limit: 10 }),
    enabled: search.length >= 2 && isOpen,
  });

  useEffect(() => {
    if (selectedMember) {
      setSearch(selectedMember.name || '');
    }
  }, [selectedMember]);

  const handleSelect = (member: Member) => {
    setSearch(member.name || '');
    setIsOpen(false);
    onSelect(member);
  };

  const handleClear = () => {
    setSearch('');
    setIsOpen(false);
    onSelect(null);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-lg border border-border-dark bg-bg-deep text-text-base text-sm focus:outline-none focus:border-indigo transition-colors"
        />
        {selectedMember && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-text-base"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && search.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-bg-card border border-border-dark rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 flex justify-center">
              <Spinner size={20} />
            </div>
          ) : members?.data && members.data.length > 0 ? (
            <div className="py-1">
              {members.data.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleSelect(member)}
                  className="w-full px-4 py-2 text-left hover:bg-bg-panel transition-colors"
                >
                  <div className="text-sm font-medium text-text-base">{member.name}</div>
                  {member.phone && (
                    <div className="text-xs text-muted">{member.phone}</div>
                  )}
                  {member.memberships && member.memberships.length > 0 && (
                    <div className="text-xs text-muted">
                      {member.memberships[0].plan.toUpperCase()} - {member.memberships[0].creditBalance.toLocaleString()} VND credit
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-muted text-center">Không tìm thấy thành viên</div>
          )}
        </div>
      )}
    </div>
  );
}
