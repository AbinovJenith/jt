'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, FileText, Truck } from 'lucide-react';

const NEXT_STATUS: Record<string, string> = {
  CONFIRMED: 'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED: 'DELIVERED',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data.data),
  });

  const transition = useMutation({
    mutationFn: (status: string) => api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['order', id] }),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Loading...</div>;
  if (!data) return null;

  const nextStatus = NEXT_STATUS[data.status];

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{data.orderNumber}</h1>
          <p className="text-sm text-gray-500">{data.customer?.companyName} · {formatDate(data.createdAt)}</p>
        </div>
        <StatusBadge status={data.status} />
        {nextStatus && (
          <button
            onClick={() => transition.mutate(nextStatus)}
            disabled={transition.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Mark as {nextStatus.replace(/_/g, ' ')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Order Items */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Order Items</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-500 font-semibold py-3 px-5">Product</th>
                <th className="text-right text-xs text-gray-500 font-semibold py-3 px-5">Qty</th>
                <th className="text-right text-xs text-gray-500 font-semibold py-3 px-5">Unit Price</th>
                <th className="text-right text-xs text-gray-500 font-semibold py-3 px-5">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.items?.map((item: any) => (
                <tr key={item.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 px-5">
                    <p className="font-medium text-gray-900">{item.variant?.product?.name}</p>
                    <p className="text-xs text-gray-400">{item.variant?.name} · {item.variant?.sku}</p>
                  </td>
                  <td className="py-3 px-5 text-right text-gray-600">{item.qty}</td>
                  <td className="py-3 px-5 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 px-5 text-right font-medium text-gray-900">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={3} className="py-3 px-5 text-right text-sm font-semibold text-gray-700">Total</td>
                <td className="py-3 px-5 text-right font-bold text-gray-900">{formatCurrency(data.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Invoices */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Invoices
            </h2>
            {data.invoices?.length === 0 && <p className="text-xs text-gray-400">No invoices yet</p>}
            {data.invoices?.map((inv: any) => (
              <div key={inv.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className="text-xs font-mono text-gray-700">{inv.invoiceNumber}</span>
                <StatusBadge status={inv.status} />
              </div>
            ))}
          </div>

          {/* Shipments */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Truck className="w-4 h-4" /> Shipments
            </h2>
            {data.shipments?.length === 0 && <p className="text-xs text-gray-400">No shipments yet</p>}
            {data.shipments?.map((sh: any) => (
              <div key={sh.id} className="py-2 border-b border-gray-100 last:border-0">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">{sh.carrier ?? 'Unknown carrier'}</span>
                  <StatusBadge status={sh.status} />
                </div>
                {sh.trackingNumber && (
                  <p className="text-xs font-mono text-gray-400 mt-1">{sh.trackingNumber}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
