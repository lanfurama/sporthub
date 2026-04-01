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
    <div className="max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-gray-900">Inventory Management</h1>
          <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Manage stock levels, service equipment and pricing.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white hover:bg-primary-hover px-3 h-8 text-[13px] font-semibold rounded-md shadow-sm flex items-center gap-1.5 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Item
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white border border-border rounded-lg p-12 shadow-card flex justify-center">
          <Spinner size={28} />
        </div>
      ) : (
        <Table headers={['Asset Name', 'Category', 'Unit Price', 'Stock Level', 'Type', 'Actions']}>
          {products?.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-semibold text-gray-900">{product.name}</TableCell>
              <TableCell className="text-gray-500 font-medium">{product.category || 'General'}</TableCell>
              <TableCell className="font-semibold text-gray-900">
                {product.price.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">VND</span>
              </TableCell>
              <TableCell>
                {product.isService ? (
                  <span className="text-gray-400 italic text-[11px]">No Physical Stock</span>
                ) : (
                  <span className={`font-semibold ${product.stock < 10 ? 'text-status-danger-text' : 'text-gray-900'}`}>
                    {product.stock}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <Badge status={product.isService ? 'inactive' : 'active'}>
                  {product.isService ? 'SERVICE' : 'INVENTORY'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingProduct(product.id)}
                    className="h-7 px-2 text-[11px] font-semibold text-primary hover:bg-primary/5 border border-primary/10 rounded transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Permanently remove this item?')) {
                        deleteMutation.mutate(product.id);
                      }
                    }}
                    className="h-7 px-2 text-[11px] font-medium text-status-danger-text hover:bg-status-danger-bg rounded transition-all"
                  >
                    Delete
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {products?.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-12 text-gray-400 italic">
                No items found in directory.
              </TableCell>
            </TableRow>
          )}
        </Table>
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
        title={editingProduct ? 'Update Inventory Record' : 'Record New Asset'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Asset Name</label>
              <input
                type="text"
                name="name"
                defaultValue={productToEdit?.name}
                required
                className="w-full"
                placeholder="e.g. Standard Racket (Rent)"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Classification</label>
              <input
                type="text"
                name="category"
                defaultValue={productToEdit?.category}
                className="w-full"
                placeholder="e.g. Equipment"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Unit Price (VND)</label>
              <input
                type="number"
                name="price"
                defaultValue={productToEdit?.price}
                required
                min={0}
                className="w-full"
              />
            </div>
            {!productToEdit?.isService && (
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  defaultValue={productToEdit?.stock}
                  min={0}
                  className="w-full"
                />
              </div>
            )}
            <div className={`flex items-center ${productToEdit?.isService ? 'pt-5' : 'pt-5 col-span-2'}`}>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isService"
                  defaultChecked={productToEdit?.isService}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-[13px] font-medium text-gray-900">Classify as Service/Rental asset</span>
              </label>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4 border-t border-border mt-6">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setEditingProduct(null);
              }}
              className="flex-1 bg-white border border-border text-gray-600 font-medium h-9 text-[13px]"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 bg-primary text-white font-semibold h-9 text-[13px] shadow-sm"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <Spinner size={16} />
              ) : (
                editingProduct ? 'Commit Changes' : 'Create Record'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
