'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, X } from 'lucide-react';
import api from '@/lib/api';
import { DataTable } from '@/components/shared/data-table';
import { cn } from '@/lib/utils';

// ── Add / Adjust Stock Modal ──────────────────────────────────────────────────

function AdjustStockModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();

  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [qty, setQty] = useState(1);
  const [operation, setOperation] = useState<'ADD' | 'SUBTRACT' | 'SET'>('ADD');
  const [error, setError] = useState('');

  // Search products by name
  const { data: productsData } = useQuery({
    queryKey: ['products-search', productSearch],
    queryFn: () =>
      api.get('/products', {
        params: { search: productSearch || undefined, limit: 20 },
      }).then((r) => r.data),
    enabled: true,
  });
  const products: any[] = productsData?.data ?? [];

  // Fetch full product detail (with variants) when one is selected
  const { data: productDetail } = useQuery({
    queryKey: ['product-detail', selectedProduct?.id],
    queryFn: () =>
      api.get(`/products/${selectedProduct.id}`).then((r) => r.data.data),
    enabled: !!selectedProduct?.id,
  });
  const variants: any[] = productDetail?.variants ?? [];

  // Warehouses
  const { data: whData } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => api.get('/inventory/warehouses').then((r) => r.data.data),
  });
  const warehouses: any[] = whData ?? [];

  const mutation = useMutation({
    mutationFn: () =>
      api.patch('/inventory/adjust', {
        variantId: selectedVariant,
        warehouseId: selectedWarehouse,
        qty: Number(qty),
        operation,
      }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      qc.invalidateQueries({ queryKey: ['inventory-low'] });
      onClose();
    },
    onError: (err: any) => setError(err.message ?? 'Failed to adjust stock'),
  });

  const canSubmit = selectedVariant && selectedWarehouse && qty > 0;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Add / Adjust Stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Step 1 — Product search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product <span className="text-red-500">*</span>
            </label>
            {selectedProduct ? (
              <div className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-blue-900">{selectedProduct.name}</p>
                  <p className="text-xs text-blue-600">{selectedProduct.category?.name}</p>
                </div>
                <button
                  onClick={() => { setSelectedProduct(null); setSelectedVariant(''); }}
                  className="text-blue-400 hover:text-blue-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by product name..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {products.length > 0 && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {products.map((p) => (
                      <li
                        key={p.id}
                        onClick={() => { setSelectedProduct(p); setProductSearch(''); setSelectedVariant(''); }}
                        className="px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <p className="font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category?.name}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Step 2 — Variant */}
          {selectedProduct && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variant / SKU <span className="text-red-500">*</span>
              </label>
              {variants.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No variants found for this product.</p>
              ) : (
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a variant...</option>
                  {variants.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.sku}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Step 3 — Warehouse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Warehouse <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select warehouse...</option>
              {warehouses.map((w: any) => (
                <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
              ))}
            </select>
          </div>

          {/* Step 4 — Operation + Qty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ADD">Add stock</option>
                <option value="SUBTRACT">Remove stock</option>
                <option value="SET">Set exact qty</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
          >
            {mutation.isPending ? 'Saving...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function InventoryPage() {
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => api.get('/inventory').then((r) => r.data),
  });

  const { data: lowStock } = useQuery({
    queryKey: ['inventory-low'],
    queryFn: () => api.get('/inventory/low-stock').then((r) => r.data.data),
  });

  const columns = [
    {
      key: 'variant',
      header: 'Product / SKU',
      render: (_: any, row: any) => (
        <div>
          <p className="font-medium text-gray-900">{row.variant?.product?.name}</p>
          <p className="text-xs text-gray-400">{row.variant?.name} · {row.variant?.sku}</p>
        </div>
      ),
    },
    {
      key: 'warehouse',
      header: 'Warehouse',
      render: (_: any, row: any) => <span className="text-gray-600">{row.warehouse?.name}</span>,
    },
    {
      key: 'qtyOnHand',
      header: 'On Hand',
      render: (v: number) => <span className="font-medium">{v}</span>,
    },
    {
      key: 'qtyReserved',
      header: 'Reserved',
      render: (v: number) => <span className="text-orange-600">{v}</span>,
    },
    {
      key: 'qtyAvailable',
      header: 'Available',
      render: (v: number, row: any) => (
        <span className={cn('font-semibold', row.isLow ? 'text-red-600' : 'text-green-700')}>
          {v} {row.isLow && '⚠'}
        </span>
      ),
    },
    {
      key: 'reorderLevel',
      header: 'Reorder At',
      render: (v: number | null) => (
        <span className="text-gray-400 text-xs">{v ?? '—'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {showModal && <AdjustStockModal onClose={() => setShowModal(false)} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.meta?.total ?? 0} SKU-warehouse combinations
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(lowStock?.length ?? 0) > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
              {lowStock.length} items below reorder level
            </div>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add / Adjust Stock
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          emptyMessage="No inventory records. Add stock using the button above."
        />
      </div>
    </div>
  );
}
