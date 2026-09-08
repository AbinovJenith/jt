'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

const UNITS = ['kg', 'litre', 'metre', 'units', 'box', 'piece', 'ton', 'gram', 'ml'];

interface SpecDraft {
  sku: string;
  qty: string;
  unit: string;
}

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', categoryId: '', description: '' });
  const [specs, setSpecs] = useState<SpecDraft[]>([{ sku: '', qty: '', unit: 'kg' }]);
  const [error, setError] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['categories-flat'],
    queryFn: () => api.get('/categories').then(r => {
      const flat: any[] = [];
      const walk = (cats: any[], depth = 0) => cats?.forEach(c => {
        flat.push({ ...c, depth });
        walk(c.children ?? [], depth + 1);
      });
      walk(r.data.data);
      return flat;
    }),
  });

  const create = useMutation({
    mutationFn: () =>
      api.post('/products', {
        name: form.name,
        categoryId: form.categoryId,
        description: form.description || undefined,
        variants: specs
          .filter(s => s.sku && s.qty)
          .map(s => ({ sku: s.sku, name: `${s.qty} ${s.unit}` })),
      }),
    onSuccess: (res) => router.push(`/products/${res.data.data.id}`),
    onError: (e: Error) => setError(e.message),
  });

  const updateSpec = (idx: number, field: keyof SpecDraft, value: string) => {
    setSpecs(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">New Product</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Basic info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} placeholder="e.g. Basmati Rice" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className={inputCls}>
              <option value="">Select category...</option>
              {categories?.map((c: any) => (
                <option key={c.id} value={c.id}>{'— '.repeat(c.depth)}{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className={`${inputCls} resize-none`} placeholder="Optional product description..." />
          </div>
        </div>

        {/* Specifications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Specifications</label>
            <button
              onClick={() => setSpecs(s => [...s, { sku: '', qty: '', unit: 'kg' }])}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Specification
            </button>
          </div>
          <div className="space-y-2">
            {specs.map((s, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-3">
                  <input
                    value={s.sku}
                    onChange={e => updateSpec(idx, 'sku', e.target.value)}
                    placeholder="Product Code"
                    className={inputCls}
                  />
                </div>
                <div className="col-span-4">
                  <input
                    type="number"
                    min="0"
                    value={s.qty}
                    onChange={e => updateSpec(idx, 'qty', e.target.value)}
                    placeholder="Quantity"
                    className={inputCls}
                  />
                </div>
                <div className="col-span-4">
                  <select
                    value={s.unit}
                    onChange={e => updateSpec(idx, 'unit', e.target.value)}
                    className={inputCls}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div className="col-span-1 flex justify-center">
                  {specs.length > 1 && (
                    <button onClick={() => setSpecs(s => s.filter((_, i) => i !== idx))} className="p-1.5 hover:bg-red-50 rounded text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">You can add more specifications and set attributes after creating the product.</p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button
            onClick={() => create.mutate()}
            disabled={!form.name || !form.categoryId || create.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {create.isPending ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </div>
    </div>
  );
}
