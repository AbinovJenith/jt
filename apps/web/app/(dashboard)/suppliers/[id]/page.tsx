'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, Package, Mail, Phone } from 'lucide-react';

export default function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => api.get(`/suppliers/${id}`).then(r => r.data.data),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Loading...</div>;
  if (!data) return null;

  const addr = data.address as any;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{data.companyName}</h1>
          <p className="text-sm text-gray-500">{data.contactName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Contact Details</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-gray-700">{data.email}</span>
            </div>
            {data.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-gray-700">{data.phone}</span>
              </div>
            )}
            {addr && (
              <div className="text-sm text-gray-500 leading-relaxed">
                {addr.street}, {addr.city}<br />
                {addr.state} — {addr.pincode}
              </div>
            )}
          </div>
          {(data.gstNumber || data.panNumber) && (
            <div className="pt-3 border-t border-gray-100 space-y-1">
              {data.gstNumber && <p className="text-xs text-gray-500">GST: <span className="font-mono text-gray-700">{data.gstNumber}</span></p>}
              {data.panNumber && <p className="text-xs text-gray-500">PAN: <span className="font-mono text-gray-700">{data.panNumber}</span></p>}
            </div>
          )}
        </div>

        {/* Products Supplied */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Products Supplied ({data.products?.length ?? 0})</h2>
          </div>
          {data.products?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No products linked yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-500 font-semibold py-3 px-5">Product / SKU</th>
                  <th className="text-right text-xs text-gray-500 font-semibold py-3 px-5">Base Price</th>
                  <th className="text-right text-xs text-gray-500 font-semibold py-3 px-5">Min Qty</th>
                  <th className="text-right text-xs text-gray-500 font-semibold py-3 px-5">Lead Time</th>
                </tr>
              </thead>
              <tbody>
                {data.products?.map((sp: any) => (
                  <tr key={sp.variantId} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-5">
                      <p className="font-medium text-gray-900">{sp.variant?.product?.name}</p>
                      <p className="text-xs text-gray-400">{sp.variant?.name} · {sp.variant?.sku}</p>
                    </td>
                    <td className="py-3 px-5 text-right font-medium text-gray-900">{formatCurrency(sp.basePrice)}</td>
                    <td className="py-3 px-5 text-right text-gray-600">{sp.minOrderQty}</td>
                    <td className="py-3 px-5 text-right text-gray-500">{sp.leadTimeDays ? `${sp.leadTimeDays}d` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
