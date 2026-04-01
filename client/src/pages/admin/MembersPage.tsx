import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-gray-900">Member Directory</h1>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Manage user profiles and membership statuses.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white hover:bg-primary-hover px-3 h-8 text-[13px] font-semibold rounded-md shadow-sm flex items-center gap-1.5 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Profile
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-border rounded-lg p-3 mb-4 shadow-card flex items-center gap-4">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name, phone or email..."
            className="w-full pl-9 h-9 text-[13px]"
          />
        </div>
        <div className="w-[160px]">
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="w-full h-9 text-[13px]"
          >
            <option value="">All Membership Plans</option>
            <option value="basic">Basic Plan</option>
            <option value="prime">Prime Plan</option>
            <option value="vip">VIP Plan</option>
          </select>
        </div>
        <button 
          onClick={() => { setSearch(''); setPlanFilter(''); }}
          className="h-9 px-3 text-[12px] font-medium text-gray-500 hover:text-gray-900"
        >
          Reset
        </button>
      </div>

      {/* Table Section */}
      {isLoading ? (
        <div className="bg-white border border-border rounded-lg p-12 shadow-card flex justify-center">
          <Spinner size={28} />
        </div>
      ) : (
        <Table
          headers={['Full Name', 'Account Status', 'Expiry Date', 'Available Credit', 'Actions']}
        >
          {members.map((member) => {
            const membership = member.memberships?.[0];
            const isExpiringSoon =
              membership &&
              new Date(membership.expiresAt).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

            return (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex flex-col py-0.5">
                    <span className="font-semibold text-gray-900 leading-tight">{member.name}</span>
                    <span className="text-[11px] text-gray-400 font-medium leading-tight">{member.phone}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {membership ? (
                    <Badge status={membership.plan}>
                      {membership.plan.toUpperCase()}
                    </Badge>
                  ) : (
                    <span className="text-[11px] text-gray-400 italic">No Membership</span>
                  )}
                </TableCell>
                <TableCell>
                  {membership ? (
                    <span className={`text-[12px] font-medium ${isExpiringSoon ? 'text-status-danger-text' : 'text-gray-600'}`}>
                      {format(new Date(membership.expiresAt), 'MMM dd, yyyy')}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {membership ? (
                    <span className="font-semibold text-gray-900">
                      {membership.creditBalance.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">VND</span>
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedMember(member.id)}
                      className="h-7 px-2 text-[11px] font-semibold text-primary hover:bg-primary/5 border border-primary/10 rounded transition-all"
                    >
                      Credit Adjustment
                    </button>
                    <button className="h-7 px-2 text-[11px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-border rounded transition-all">
                      Edit
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {members.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-12 text-gray-400 italic">
                No matching members found.
              </TableCell>
            </TableRow>
          )}
        </Table>
      )}

      {/* Modals - Refined for CRM style */}
      <Modal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        title="Add New Member Profile"
        size="md"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input type="text" name="name" required className="w-full" placeholder="e.g. Robert Fox" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Phone</label>
              <input type="tel" name="phone" required className="w-full" placeholder="+84 000 000 000" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email (Optional)</label>
            <input type="email" name="email" className="w-full" placeholder="robert.fox@company.com" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Membership Tier</label>
            <select name="plan" required className="w-full">
              <option value="basic">Basic Plan</option>
              <option value="prime">Prime Plan</option>
              <option value="vip">VIP Plan</option>
            </select>
          </div>
          <div className="flex gap-2 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 bg-white border border-border text-gray-600 font-medium h-9 text-[13px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMemberMutation.isPending}
              className="flex-1 bg-primary text-white font-semibold h-9 text-[13px] shadow-sm"
            >
              {createMemberMutation.isPending ? <Spinner size={16} /> : 'Create Profile'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!selectedMember}
        onOpenChange={(open) => !open && setSelectedMember(null)}
        title="Credit Adjustment"
        size="sm"
      >
        <form onSubmit={handleAddCredit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Adjustment Amount (VND)</label>
            <input
              type="number"
              name="amount"
              required
              min={1}
              className="w-full"
              placeholder="e.g. 500000"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Adjustment Reason</label>
            <input
              type="text"
              name="reason"
              className="w-full"
              placeholder="Manual adjustment, top-up, etc."
            />
          </div>
          <div className="flex gap-2 pt-2 mt-4">
            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              className="flex-1 bg-white border border-border text-gray-600 font-medium h-9 text-[13px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addCreditMutation.isPending}
              className="flex-1 bg-primary text-white font-semibold h-9 text-[13px]"
            >
              {addCreditMutation.isPending ? <Spinner size={16} /> : 'Apply Adjustment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
