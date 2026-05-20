'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { membersApi } from '@/src/lib/api/members';
import type { Member } from '@/src/types';
import Spinner from '@/components/Spinner';

interface MemberSearchProps {
  onSelect: (member: Member | null) => void;
  selectedMember?: Member | null;
  placeholder?: string;
}

export default function MemberSearch({ onSelect, selectedMember, placeholder }: MemberSearchProps) {
  const t = useTranslations();
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
        <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle" size={16} />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder ?? t('booking.searchMemberPlaceholder')}
          className="input-field pl-10 pr-10"
        />
        {selectedMember && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear selection"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center text-ink-subtle hover:text-ink rounded-md hover:bg-surface-muted"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && search.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-xl shadow-sport-lg max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 flex justify-center text-primary">
              <Spinner size={20} />
            </div>
          ) : members?.data && members.data.length > 0 ? (
            <div className="py-1">
              {members.data.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => handleSelect(member)}
                  className="w-full px-4 py-2.5 text-left hover:bg-surface-muted transition-colors"
                >
                  <div className="text-sm font-semibold text-ink">{member.name}</div>
                  {member.phone && (
                    <div className="text-xs text-ink-muted">{member.phone}</div>
                  )}
                  {member.memberships && member.memberships.length > 0 && (
                    <div className="text-xs text-ink-subtle mt-0.5">
                      <span className="font-bold text-primary">
                        {member.memberships[0].plan.toUpperCase()}
                      </span>
                      {' · '}
                      <span className="tabular-nums">
                        {member.memberships[0].creditBalance.toLocaleString()} VND
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-sm text-ink-subtle text-center">
              {t('booking.memberNotFound')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
