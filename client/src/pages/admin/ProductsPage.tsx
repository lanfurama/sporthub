import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../../api/products';
import { Table, TableRow, TableCell } from '../../components/Table';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import Badge from '../../components/Badge';

export default function AdminProductsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowAddModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')) || 0,
      isService: formData.get('isService') === 'on',
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const productToEdit = editingProduct ? products?.find((p) => p.id === editingProduct) : null;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-black text-white uppercase tracking-tight">Resource <span className="text-primary italic">Inventory</span></h1>
          <p className="text-xs font-bold text-gray-500 mt-1.5 uppercase tracking-widest">Asset tracking & equipment availability</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary h-11 px-6 text-[13px] rounded-xl shadow-neon"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4 mr-2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Asset
        </button>
      </div>

      {isLoading ? (
        <div className="glass-card p-20 flex justify-center border-white/5 shadow-2xl">
          <Spinner size={32} />
        </div>
      ) : (
        <div className="glass-card border-white/5 overflow-hidden shadow-2xl">
          <Table headers={['Asset Name', 'Classification', 'Unit Price', 'Stock Metrics', 'Category', 'Actions']}>
            {products?.map((product) => (
              <TableRow key={product.id} className="hover:bg-white/[0.02] border-white/5">
                <TableCell className="font-bold text-white">{product.name}</TableCell>
                <TableCell className="text-gray-500 font-black text-[10px] uppercase tracking-widest">{product.category || 'General'}</TableCell>
                <TableCell className="font-display font-black text-white">
                  {product.price.toLocaleString()} <span className="text-[10px] text-gray-500 font-normal uppercase ml-1">vnd</span>
                </TableCell>
                <TableCell>
                  {product.isService ? (
                    <span className="text-gray-600 italic text-[10px] font-black uppercase tracking-widest">Unlimited Service</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-sm ${product.stock < 10 ? 'text-accent animate-pulse' : 'text-white'}`}>
                        {product.stock}
                      </span>
                      <span className="text-[9px] text-gray-600 font-black uppercase">Units</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge status={product.isService ? 'inactive' : 'active'}>
                    {product.isService ? 'SERVICE' : 'STOCK'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditingProduct(product.id)}
                      className="h-8 px-4 text-[10px] font-black text-primary hover:bg-primary/10 border border-primary/20 rounded-lg transition-all uppercase tracking-widest"
                    >
                      Configure
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Permanently decommission this asset?')) {
                          deleteMutation.mutate(product.id);
                        }
                      }}
                      className="h-8 px-4 text-[10px] font-black text-gray-500 hover:text-accent hover:bg-accent/5 border border-white/5 rounded-lg transition-all uppercase tracking-widest"
                    >
                      Delete
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
          {products?.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-xs font-black text-gray-600 uppercase tracking-[0.2em]">Inventory empty</p>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={showAddModal || !!editingProduct}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            setEditingProduct(null);
          }
        }}
        title={editingProduct ? 'Configure Asset Record' : 'Initialize New Asset'}
        size="md"
        isDark={true}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Asset Nomenclature</label>
              <input
                type="text"
                name="name"
                defaultValue={productToEdit?.name}
                required
                className="input-field py-2.5 text-xs font-bold"
                placeholder="e.g. Pro Racket (Rental)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Classification</label>
              <input
                type="text"
                name="category"
                defaultValue={productToEdit?.category}
                className="input-field py-2.5 text-xs font-bold"
                placeholder="e.g. Equipment"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Unit Valuation (VND)</label>
              <input
                type="number"
                name="price"
                defaultValue={productToEdit?.price}
                required
                min={0}
                className="input-field py-2.5 text-xs font-bold text-primary"
              />
            </div>
            {!productToEdit?.isService && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Stock Level</label>
                <input
                  type="number"
                  name="stock"
                  defaultValue={productToEdit?.stock}
                  min={0}
                  className="input-field py-2.5 text-xs font-bold"
                />
              </div>
            )}
            <div className={`flex items-center ${productToEdit?.isService ? 'pt-4' : 'pt-4 col-span-2'}`}>
              <label className="flex items-center gap-3 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  name="isService"
                  defaultChecked={productToEdit?.isService}
                  className="w-5 h-5 rounded-lg border-white/10 bg-surface text-primary focus:ring-primary transition-all checked:border-primary"
                />
                <span className="text-[12px] font-black text-gray-400 group-hover:text-white uppercase tracking-tight transition-colors">Classify as Virtual Service/Rental Asset</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-4 pt-6 border-t border-white/5 mt-2">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setEditingProduct(null);
              }}
              className="flex-1 btn-secondary h-11 text-[11px] font-black uppercase tracking-widest"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 btn-primary h-11 text-[11px] font-black uppercase tracking-widest shadow-neon"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <Spinner size={16} />
              ) : (
                editingProduct ? 'Commit Changes' : 'Initialize Record'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
