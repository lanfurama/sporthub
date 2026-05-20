'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, MagnifyingGlass } from '@phosphor-icons/react';
import { membersApi } from '@/src/lib/api/members';
import { Table, TableRow, TableCell } from '@/components/Table';
import Modal from '@/components/Modal';
import Spinner from '@/components/Spinner';
import Badge from '@/components/Badge';
import { format } from 'date-fns';

export default function AdminMembersPage() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: membersData, isLoading } = useQuery({
    queryKey: ['members', search, planFilter],
    queryFn: () =>
      membersApi.list({
        search,
        ...(planFilter ? { plan: planFilter } : {}),
        limit: 100,
      }),
  });

  const createMemberMutation = useMutation({
    mutationFn: (data: any) => membersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setShowAddModal(false);
    },
  });

  const addCreditMutation = useMutation({
    mutationFn: ({ id, amount, reason }: { id: string; amount: number; reason?: string }) =>
      membersApi.addCredit(id, amount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setSelectedMember(null);
    },
  });

  const members = membersData?.data || [];

  const handleAddMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMemberMutation.mutate({
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email') || undefined,
      plan: formData.get('plan'),
    });
  };

  const handleAddCredit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (selectedMember) {
      addCreditMutation.mutate({
        id: selectedMember,
        amount: Number(formData.get('amount')),
        reason: formData.get('reason')?.toString() || undefined,
      });
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-ink tracking-tight">
            Member Directory
          </h1>
          <p className="text-sm text-ink-muted mt-1.5">
            User database & membership management
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-sm"
        >
          <UserPlus size={16} weight="regular" />
          Add member
        </button>
      </div>

      <div className="sport-card p-4 flex items-center gap-3">
        <div className="flex-1 relative">
          <MagnifyingGlass
            size={16}
            weight="regular"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-subtle pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="input-field pl-10 h-11 text-sm"
          />
        </div>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="input-field h-11 text-sm w-[200px] appearance-none"
        >
          <option value="">All tiers</option>
          <option value="basic">Basic</option>
          <option value="prime">Prime</option>
          <option value="vip">VIP</option>
        </select>
        <button
          onClick={() => { setSearch(''); setPlanFilter(''); }}
          className="h-11 px-4 text-sm font-semibold text-ink-muted hover:text-ink transition-colors"
        >
          Reset
        </button>
      </div>

      {isLoading ? (
        <div className="sport-card p-20 flex justify-center">
          <Spinner size={32} className="text-primary" />
        </div>
      ) : (
        <div className="sport-card overflow-hidden">
          <Table headers={['Name', 'Tier', 'Expires', 'Balance', 'Actions']}>
            {members.map((member) => {
              const membership = member.memberships?.[0];
              const isExpiringSoon =
                membership &&
                new Date(membership.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

              return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-ink">{member.name}</span>
                      <span className="text-xs text-ink-subtle mt-0.5">{member.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {membership ? (
                      <Badge status={membership.plan}>
                        {membership.plan.toUpperCase()}
                      </Badge>
                    ) : (
                      <span className="text-xs text-ink-subtle">No plan</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {membership ? (
                      <span className={`text-sm font-medium ${isExpiringSoon ? 'text-accent' : 'text-ink-muted'}`}>
                        {format(new Date(membership.expiresAt), 'MMM dd, yyyy')}
                      </span>
                    ) : (
                      <span className="text-ink-subtle">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {membership ? (
                      <span className="font-semibold text-ink tabular-nums">
                        {membership.creditBalance.toLocaleString()}{' '}
                        <span className="text-[10px] text-ink-subtle font-normal ml-0.5">VND</span>
                      </span>
                    ) : (
                      <span className="text-ink-subtle">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedMember(member.id)}
                        className="h-8 px-3.5 text-xs font-semibold text-primary hover:bg-primary-subtle border border-primary/20 rounded-lg transition-all active:scale-[0.98]"
                      >
                        Adjust wallet
                      </button>
                      <button className="h-8 px-3.5 text-xs font-semibold text-ink-muted hover:text-ink hover:bg-surface-muted border border-border rounded-lg transition-all">
                        Profile
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
          {members.length === 0 && (
            <div className="py-16 text-center text-sm text-ink-subtle">
              No members match the criteria
            </div>
          )}
        </div>
      )}

      <Modal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Add new member"
        size="md"
      >
        <form onSubmit={handleAddMember} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-muted">Full name</label>
              <input type="text" name="name" required className="input-field" placeholder="e.g. Mai Phương Linh" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-muted">Phone</label>
              <input type="tel" name="phone" required className="input-field" placeholder="+84 …" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted">Email (optional)</label>
            <input type="email" name="email" className="input-field" placeholder="name@example.com" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted">Initial plan</label>
            <select name="plan" required className="input-field">
              <option value="basic">Basic</option>
              <option value="prime">Prime</option>
              <option value="vip">VIP</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMemberMutation.isPending}
              className="flex-1 btn-primary text-sm"
            >
              {createMemberMutation.isPending ? <Spinner size={16} /> : 'Create member'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!selectedMember}
        onOpenChange={(open) => !open && setSelectedMember(null)}
        title="Wallet adjustment"
        size="sm"
      >
        <form onSubmit={handleAddCredit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted">Amount (VND)</label>
            <input
              type="number"
              name="amount"
              required
              min={1}
              className="input-field font-semibold text-primary"
              placeholder="e.g. 500000"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-ink-muted">Reason</label>
            <input
              type="text"
              name="reason"
              className="input-field"
              placeholder="Top-up, refund, manual adjustment…"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              className="flex-1 btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addCreditMutation.isPending}
              className="flex-1 btn-primary text-sm"
            >
              {addCreditMutation.isPending ? <Spinner size={16} /> : 'Apply'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
