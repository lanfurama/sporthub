'use client';

import type { Member } from '@/src/types';

interface MemberSearchProps {
  onSelect: (member: Member | null) => void;
  selectedMember?: Member | null;
  placeholder?: string;
}

// TODO: Port MemberSearch in Phase 3 — relies on membersApi which is admin-only.
// The customer BookingFlow uses this only in the guest-checkout path for members
// to apply their account benefits (discount + credit). For now this is a no-op
// placeholder that renders an explanatory message and never calls onSelect.
export default function MemberSearch(_props: MemberSearchProps) {
  return (
    <div className="text-xs text-ink-muted italic">
      Member search is coming soon. Members will be able to apply discounts and credit at checkout.
    </div>
  );
}
