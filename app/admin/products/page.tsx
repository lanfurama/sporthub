'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from '@phosphor-icons/react';
import { productsApi } from '@/src/lib/api/products';
import { Table, TableRow, TableCell } from '@/components/Table';
import Modal from '@/components/Modal';
import Spinner from '@/components/Spinner';
import Badge from '@/components/Badge';

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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-ink tracking-tight">
            Inventory
          </h1>
          <p className="text-sm text-ink-muted mt-1.5">
            Asset tracking & equipment availability
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-sm"
        >
          <Plus size={16} weight="bold" />
          Add product
        </button>
      </div>

      {isLoading ? (
        <div className="sport-card p-20 flex justify-center">
          <Spinner size={32} className="text-primary" />
        </div>
      ) : (
        <div className="sport-card overflow-hidden">
          <Table headers={['Name', 'Category', 'Unit price', 'Stock', 'Type', 'Actions']}>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-semibold text-ink">{product.name}</TableCell>
                <TableCell className="text-ink-muted">{product.category || 'General'}</TableCell>
                <TableCell className="font-semibold text-ink tabular-nums">
                  {product.price.toLocaleString()}{' '}
                  <span className="text-[10px] text-ink-subtle font-normal ml-0.5">VND</span>
                </TableCell>
                <TableCell>
                  {product.isService ? (
                    <span className="text-xs text-ink-subtle italic">Unlimited</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold tabular-nums ${product.stock < 10 ? 'text-accent' : 'text-ink'}`}>
                        {product.stock}
                      </span>
                      <span className="text-xs text-ink-subtle">units</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge status={product.isService ? 'inactive' : 'active'}>
                    {product.isService ? 'Service' : 'Stock'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingProduct(product.id)}
                      className="h-8 px-3.5 text-xs font-semibold text-primary hover:bg-primary-subtle border border-primary/20 rounded-lg transition-all active:scale-[0.98]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Delete this product?')) {
                          deleteMutation.mutate(product.id);
                        }
                      }}
                      className="h-8 px-3.5 text-xs font-semibold text-ink-muted hover:text-accent hover:bg-accent-subtle border border-border rounded-lg transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
          {products?.length === 0 && (
            <div className="py-16 text-center text-sm text-ink-subtle">
              Inventory is empty
            </div>
          )}
        </div>
      )}

      <Modal
        open={showAddModal || !!editingProduct}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            setEditingProduct(null);
          }
        }}
        title={editingProduct ? 'Edit product' : 'New product'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-ink-muted">Name</label>
              <input
                type="text"
                name="name"
                defaultValue={productToEdit?.name}
                required
                className="input-field"
                placeholder="e.g. Pro Racket (rental)"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-muted">Category</label>
              <input
                type="text"
                name="category"
                defaultValue={productToEdit?.category}
                className="input-field"
                placeholder="e.g. Equipment"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink-muted">Price (VND)</label>
              <input
                type="number"
                name="price"
                defaultValue={productToEdit?.price}
                required
                min={0}
                className="input-field font-semibold text-primary"
              />
            </div>
            {!productToEdit?.isService && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-ink-muted">Stock</label>
                <input
                  type="number"
                  name="stock"
                  defaultValue={productToEdit?.stock}
                  min={0}
                  className="input-field"
                />
              </div>
            )}
            <div className={`flex items-center ${productToEdit?.isService ? 'pt-2' : 'pt-2 col-span-2'}`}>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="isService"
                  defaultChecked={productToEdit?.isService}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <span className="text-sm text-ink-muted">This is a service / rental (no stock tracking)</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setEditingProduct(null);
              }}
              className="flex-1 btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 btn-primary text-sm"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <Spinner size={16} />
              ) : (
                editingProduct ? 'Save changes' : 'Create product'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
