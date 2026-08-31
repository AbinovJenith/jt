'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

const NEXT: Record<string, string> = {
  DRAFT: 'SENT',
  SENT: 'CONFIRMED',
  CONFIRMED: 'PARTIALLY_RECEIVED',
};

export default function PurchaseOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['po', id],
    queryFn: () => api.get(`/purchase-orders/${id}`).then(r => r.data.data),
  });

  const transition = useMutation({
    mutationFn: (status: string) => api.patch(`/purchase-orders/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['po', id] }),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Loading...</div>;
  if (!data) return null;

  const nextStatus = NEXT[data.status];

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{data.poNumber}</h1>
          <p className="text-sm text-gray-500">{data.supplier?.companyName} · {formatDate(data.createdAt)}</p>
        </div>
        <StatusBadge status={data.status} />
        {nextStatus && (
          <button
            onClick={() => transition.mutate(nextStatus)}
            disabled={transition.isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            Mark {nextStatus.replace(/_/g, ' ')}
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs text-gray-500 font-semibold py-3 px-5">Product</th>
              <th className="text-right text-xs text-gray-500 font-semibold py-3 px-5">Ordered</th>
              <th className="text-right text-xs text-gray-500 font-semibold py-3 px-5">Received</th>
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
                <td className="py-3 px-5 text-right text-gray-700">{item.qty}</td>
                <td className="py-3 px-5 text-right">
                  <span className={item.qtyReceived >= item.qty ? 'text-green-600 font-medium' : 'text-orange-600'}>
                    {item.qtyReceived}
                  </span>
                </td>
                <td className="py-3 px-5 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                <td className="py-3 px-5 text-right font-semibold text-gray-900">{formatCurrency(item.totalPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 border-t border-gray-200">
              <td colSpan={4} className="py-3 px-5 text-right font-bold text-gray-900 text-sm">Total</td>
              <td className="py-3 px-5 text-right font-bold text-gray-900">{formatCurrency(data.totalAmount)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {data.notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-2">Notes</h2>
          <p className="text-sm text-gray-600">{data.notes}</p>
        </div>
      )}
    </div>
  );
}
