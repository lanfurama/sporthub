import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from 'lucide-react';
import { membersApi } from '../../api/members';
import { Table, TableRow, TableCell } from '../../components/Table';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import Badge from '../../components/Badge';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight">Member <span className="text-primary italic">Directory</span></h1>
          <p className="text-xs font-bold text-gray-500 mt-1.5 uppercase tracking-widest">Global user database management</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary h-11 px-6 text-[13px] rounded-xl shadow-neon"
        >
          <User className="w-4 h-4 mr-2" />
          Add Profile
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 border-white/5 flex items-center gap-4 shadow-2xl">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by identity, phone or email..."
            className="input-field pl-12 h-11 text-xs font-bold"
          />
        </div>
        <div className="w-[200px]">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="input-field h-11 text-xs font-bold appearance-none"
          >
            <option value="" className="bg-surface">All Tiers</option>
            <option value="basic" className="bg-surface">Basic Access</option>
            <option value="prime" className="bg-surface">Prime Membership</option>
            <option value="vip" className="bg-surface">VIP Elite</option>
          </select>
        </div>
        <button 
          onClick={() => { setSearch(''); setPlanFilter(''); }}
          className="h-11 px-4 text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="glass-card p-20 flex justify-center border-white/5 shadow-2xl">
          <Spinner size={32} />
        </div>
      ) : (
        <div className="glass-card border-white/5 overflow-hidden shadow-2xl">
          <Table
            headers={['Full Identity', 'Membership Tier', 'Expiration', 'Balance', 'Actions']}
          >
            {members.map((member) => {
              const membership = member.memberships?.[0];
              const isExpiringSoon =
                membership &&
                new Date(membership.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

              return (
                <TableRow key={member.id} className="hover:bg-white/[0.02] border-white/5">
                  <TableCell>
                    <div className="flex flex-col py-1">
                      <span className="font-bold text-white leading-tight">{member.name}</span>
                      <span className="text-[10px] text-gray-500 font-black uppercase tracking-wider mt-1">{member.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {membership ? (
                      <Badge status={membership.plan}>
                        {membership.plan.toUpperCase()}
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-gray-600 font-black uppercase italic">Unranked</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {membership ? (
                      <span className={`text-[12px] font-bold ${isExpiringSoon ? 'text-accent' : 'text-gray-400'}`}>
                        {format(new Date(membership.expiresAt), 'MMM dd, yyyy')}
                      </span>
                    ) : (
                      <span className="text-gray-700">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {membership ? (
                      <span className="font-display font-black text-white">
                        {membership.creditBalance.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal uppercase ml-1">vnd</span>
                      </span>
                    ) : (
                      <span className="text-gray-700">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedMember(member.id)}
                        className="h-8 px-3 text-[10px] font-black text-primary hover:bg-primary/10 border border-primary/20 rounded-lg transition-all uppercase tracking-widest"
                      >
                        Adjust Wallet
                      </button>
                      <button className="h-8 px-3 text-[10px] font-black text-gray-500 hover:text-white hover:bg-white/5 border border-white/5 rounded-lg transition-all uppercase tracking-widest">
                        Profile
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
          {members.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-xs font-black text-gray-600 uppercase tracking-[0.2em]">No members matching criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Modals - Refined for Dark Theme */}
      <Modal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Add New Member Profile"
        size="md"
        isDark={true}
      >
        <form onSubmit={handleAddMember} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <input type="text" name="name" required className="input-field py-2.5 text-xs font-bold" placeholder="e.g. Robert Fox" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Phone Number</label>
              <input type="tel" name="phone" required className="input-field py-2.5 text-xs font-bold" placeholder="+84 000 000 000" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Email (Optional)</label>
            <input type="email" name="email" className="input-field py-2.5 text-xs font-bold" placeholder="robert.fox@company.com" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Initial Plan</label>
            <select name="plan" required className="input-field py-2.5 text-xs font-bold">
              <option value="basic" className="bg-surface">Basic Access</option>
              <option value="prime" className="bg-surface">Prime Membership</option>
              <option value="vip" className="bg-surface">VIP Elite</option>
            </select>
          </div>
          <div className="flex gap-4 pt-6 border-t border-white/5">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 btn-secondary h-11 text-[11px] font-black uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMemberMutation.isPending}
              className="flex-1 btn-primary h-11 text-[11px] font-black uppercase tracking-widest shadow-neon"
            >
              {createMemberMutation.isPending ? <Spinner size={16} /> : 'Create Identity'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!selectedMember}
        onOpenChange={(open) => !open && setSelectedMember(null)}
        title="Wallet Adjustment"
        size="sm"
        isDark={true}
      >
        <form onSubmit={handleAddCredit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Adjustment Amount (VND)</label>
            <input
              type="number"
              name="amount"
              required
              min={1}
              className="input-field py-2.5 text-xs font-bold text-primary"
              placeholder="e.g. 500000"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Reason</label>
            <input
              type="text"
              name="reason"
              className="input-field py-2.5 text-xs font-bold"
              placeholder="Manual adjustment, top-up, etc."
            />
          </div>
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              className="flex-1 btn-secondary h-10 text-[10px] font-black uppercase tracking-widest"
            >
              Abort
            </button>
            <button
              type="submit"
              disabled={addCreditMutation.isPending}
              className="flex-1 btn-primary h-10 text-[10px] font-black uppercase tracking-widest shadow-neon"
            >
              {addCreditMutation.isPending ? <Spinner size={16} /> : 'Apply Sync'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
