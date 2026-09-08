'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, Plus, X, Tag } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

// ── Set Price Modal ───────────────────────────────────────────────────────────

function SetPriceModal({
  variantId,
  variantName,
  onClose,
}: {
  variantId: string;
  variantName: string;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const { id: productId } = useParams<{ id: string }>();

  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [minOrderQty, setMinOrderQty] = useState('1');
  const [leadTimeDays, setLeadTimeDays] = useState('');
  const [error, setError] = useState('');

  // Load suppliers by name
  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers-list'],
    queryFn: () => api.get('/suppliers').then((r) => r.data.data),
  });
  const suppliers: any[] = suppliersData ?? [];

  const mutation = useMutation({
    mutationFn: () =>
      api.post(`/suppliers/${selectedSupplier}/products`, {
        variantId,
        basePrice: Number(basePrice),
        minOrderQty: Number(minOrderQty),
        leadTimeDays: leadTimeDays ? Number(leadTimeDays) : undefined,
      }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['product', productId] });
      onClose();
    },
    onError: (err: any) => setError(err.message ?? 'Failed to set price'),
  });

  const canSubmit = selectedSupplier && basePrice && Number(basePrice) > 0;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div>
            <h2 className="font-semibold text-gray-900">Set Price</h2>
            <p className="text-xs text-gray-500 mt-0.5">{variantName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Supplier <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select supplier...</option>
              {suppliers.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.companyName}
                </option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* MOQ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min. Order Qty</label>
              <input
                type="number"
                min="1"
                value={minOrderQty}
                onChange={(e) => setMinOrderQty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {/* Lead time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lead Time (days)</label>
              <input
                type="number"
                min="0"
                placeholder="optional"
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-gray-200">
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
            {mutation.isPending ? 'Saving...' : 'Save Price'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pricingVariant, setPricingVariant] = useState<{ id: string; name: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get(`/products/${id}`).then((r) => r.data.data),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Loading...</div>;
  if (!data) return null;

  return (
    <div className="space-y-5 max-w-5xl">
      {pricingVariant && (
        <SetPriceModal
          variantId={pricingVariant.id}
          variantName={pricingVariant.name}
          onClose={() => setPricingVariant(null)}
        />
      )}

      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{data.name}</h1>
          <p className="text-sm text-gray-500">{data.category?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Variants */}
        <div className="lg:col-span-2 space-y-4">
          {data.description && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
              <p className="text-sm text-gray-600">{data.description}</p>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">
                Specifications ({data.variants?.length ?? 0})
              </h2>
            </div>

            {data.variants?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No specifications added</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.variants?.map((variant: any) => (
                  <div key={variant.id} className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900">{variant.name}</p>
                        <p className="text-xs font-mono text-gray-400">Product Code: {variant.sku}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Stock */}
                        <div className="text-right">
                          {variant.inventoryItems?.map((inv: any) => (
                            <p key={inv.id} className="text-xs text-gray-500">
                              {inv.warehouse?.name}:{' '}
                              <span className="font-semibold text-gray-900">
                                {inv.qtyOnHand - inv.qtyReserved}
                              </span>{' '}
                              avail
                            </p>
                          ))}
                        </div>
                        {/* Set price button */}
                        <button
                          onClick={() => setPricingVariant({ id: variant.id, name: `${data.name} — ${variant.name}` })}
                          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-400 px-2.5 py-1.5 rounded-lg transition-colors"
                        >
                          <Tag className="w-3.5 h-3.5" />
                          Set Price
                        </button>
                      </div>
                    </div>

                    {/* Attributes */}
                    {variant.attributes?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {variant.attributes.map((a: any) => (
                          <span key={a.id} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            <span className="text-gray-400">{a.attribute?.name}:</span>{' '}
                            {a.value} {a.attribute?.unit ?? ''}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Existing supplier prices */}
                    {variant.supplierProducts?.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {variant.supplierProducts.map((sp: any) => (
                          <div key={sp.supplierId} className="bg-blue-50 rounded-lg px-3 py-2 text-xs">
                            <p className="font-medium text-gray-700">{sp.supplier?.companyName}</p>
                            <p className="text-blue-700 font-semibold mt-0.5">
                              {formatCurrency(sp.basePrice)} · MOQ: {sp.minOrderQty}
                              {sp.leadTimeDays ? ` · ${sp.leadTimeDays}d lead` : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        No price set — click "Set Price" to add one.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Side: images + documents */}
        <div className="space-y-4">
          {data.images?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Images</h2>
              <div className="grid grid-cols-2 gap-2">
                {data.images.map((img: any) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt={img.altText ?? data.name}
                    className="w-full aspect-square object-cover rounded-lg border border-gray-100"
                  />
                ))}
              </div>
            </div>
          )}
          {data.documents?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Documents</h2>
              <div className="space-y-2">
                {data.documents.map((doc: any) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <span className="bg-gray-100 text-gray-500 text-xs px-1.5 py-0.5 rounded">
                      {doc.type}
                    </span>
                    {doc.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
