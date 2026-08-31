'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { ArrowLeft, Plus, Trash2, Search } from 'lucide-react';

interface LineItem {
  variantId: string;
  variantLabel: string;
  qty: number;
  notes: string;
}

export default function NewRFQPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preCustomerId = searchParams.get('customerId') ?? '';

  const [customerId, setCustomerId] = useState(preCustomerId);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductPicker, setShowProductPicker] = useState(false);

  const { data: customers } = useQuery({
    queryKey: ['customers-select'],
    queryFn: () => api.get('/customers', { params: { limit: 100 } }).then(r => r.data.data),
  });

  const { data: products } = useQuery({
    queryKey: ['products-search', productSearch],
    queryFn: () => api.get('/products', { params: { search: productSearch, limit: 20 } }).then(r => r.data.data),
    enabled: showProductPicker,
  });

  const create = useMutation({
    mutationFn: () =>
      api.post('/rfq', {
        customerId,
        notes: notes || undefined,
        items: items.map(i => ({ variantId: i.variantId, qty: i.qty, notes: i.notes || undefined })),
      }),
    onSuccess: (res) => router.push(`/rfq/${res.data.data.id}`),
  });

  const addVariant = (variant: any, productName: string) => {
    if (items.find(i => i.variantId === variant.id)) return;
    setItems(prev => [...prev, {
      variantId: variant.id,
      variantLabel: `${productName} — ${variant.name} (${variant.sku})`,
      qty: 1,
      notes: '',
    }]);
    setShowProductPicker(false);
    setProductSearch('');
  };

  const updateItem = (idx: number, field: keyof LineItem, value: any) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">New RFQ</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Customer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
          <select
            value={customerId}
            onChange={e => setCustomerId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select customer...</option>
            {customers?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.companyName} ({c.email})</option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Any special requirements..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Items *</label>
            <button
              onClick={() => setShowProductPicker(!showProductPicker)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {/* Product picker */}
          {showProductPicker && (
            <div className="border border-gray-200 rounded-lg p-3 mb-3 bg-gray-50">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {products?.map((product: any) =>
                  product.variants?.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => addVariant(variant, product.name)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-white rounded-lg"
                    >
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{variant.name} · {variant.sku}</p>
                    </button>
                  ))
                )}
                {products?.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-3">No products found</p>
                )}
              </div>
            </div>
          )}

          {/* Line items */}
          {items.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-sm text-gray-400">No items added yet. Click "Add Product" above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={item.variantId} className="border border-gray-200 rounded-lg p-3 grid grid-cols-12 gap-3 items-start">
                  <div className="col-span-6">
                    <p className="text-sm font-medium text-gray-900">{item.variantLabel}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-500 mb-1 block">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={e => updateItem(idx, 'qty', Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs text-gray-500 mb-1 block">Notes</label>
                    <input
                      value={item.notes}
                      onChange={e => updateItem(idx, 'notes', e.target.value)}
                      placeholder="Optional..."
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-1 pt-5">
                    <button onClick={() => removeItem(idx)} className="p-1.5 hover:bg-red-50 rounded text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {create.error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{(create.error as Error).message}</p>
        )}

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => create.mutate()}
            disabled={!customerId || items.length === 0 || create.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {create.isPending ? 'Creating...' : 'Create RFQ'}
          </button>
        </div>
      </div>
    </div>
  );
}
