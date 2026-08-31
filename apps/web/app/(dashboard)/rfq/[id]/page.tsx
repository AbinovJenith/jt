'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, Plus, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';

const TRANSITIONS: Record<string, string[]> = {
  DRAFT:        ['SUBMITTED', 'CANCELLED'],
  SUBMITTED:    ['UNDER_REVIEW', 'CANCELLED'],
  UNDER_REVIEW: ['QUOTED', 'CANCELLED'],
};

export default function RFQDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['rfq', id],
    queryFn: () => api.get(`/rfq/${id}`).then(r => r.data.data),
  });

  const transition = useMutation({
    mutationFn: (status: string) => api.patch(`/rfq/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rfq', id] }),
  });

  const removeItem = useMutation({
    mutationFn: (itemId: string) => api.delete(`/rfq/${id}/items/${itemId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rfq', id] }),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Loading...</div>;
  if (!data) return null;

  const nextActions = TRANSITIONS[data.status] ?? [];

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{data.rfqNumber}</h1>
          <p className="text-sm text-gray-500">{data.customer?.companyName} · {formatDate(data.createdAt)}</p>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {/* Actions */}
      {nextActions.length > 0 && (
        <div className="flex gap-2">
          {nextActions.map(s => (
            <button
              key={s}
              onClick={() => transition.mutate(s)}
              disabled={transition.isPending}
              className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 ${
                s === 'CANCELLED'
                  ? 'text-red-700 bg-red-50 hover:bg-red-100 border border-red-200'
                  : 'text-white bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
          {data.status === 'QUOTED' && (
            <Link
              href={`/quotations/new?rfqId=${id}`}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Create Quotation
            </Link>
          )}
          {(data.status === 'DRAFT' || data.status === 'SUBMITTED') && data.status === 'UNDER_REVIEW' && (
            <Link
              href={`/quotations/new?rfqId=${id}`}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg"
            >
              Create Quotation
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Items */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Requested Items ({data.items?.length ?? 0})</h2>
          </div>
          {data.items?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No items</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-500 font-semibold py-3 px-5">Product</th>
                  <th className="text-right text-xs text-gray-500 font-semibold py-3 px-5">Qty</th>
                  {data.status === 'DRAFT' && <th className="py-3 px-5" />}
                </tr>
              </thead>
              <tbody>
                {data.items?.map((item: any) => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 px-5">
                      <p className="font-medium text-gray-900">{item.variant?.product?.name}</p>
                      <p className="text-xs text-gray-400">{item.variant?.name} · {item.variant?.sku}</p>
                      {item.notes && <p className="text-xs text-gray-500 mt-1 italic">{item.notes}</p>}
                    </td>
                    <td className="py-3 px-5 text-right font-semibold text-gray-900">{item.qty}</td>
                    {data.status === 'DRAFT' && (
                      <td className="py-3 px-5">
                        <button
                          onClick={() => removeItem.mutate(item.id)}
                          className="p-1.5 hover:bg-red-50 rounded text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Side: Quotations + Meta */}
        <div className="space-y-4">
          {/* Notes */}
          {data.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Notes</h2>
              <p className="text-sm text-gray-600">{data.notes}</p>
            </div>
          )}

          {/* Quotations */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              Quotations ({data.quotations?.length ?? 0})
            </h2>
            {data.quotations?.length === 0 ? (
              <p className="text-xs text-gray-400">No quotations yet</p>
            ) : (
              <div className="space-y-2">
                {data.quotations?.map((q: any) => (
                  <Link
                    key={q.id}
                    href={`/quotations/${q.id}`}
                    className="flex items-center justify-between py-2 hover:bg-gray-50 rounded px-1 -mx-1"
                  >
                    <span className="text-xs font-mono text-blue-600">{q.quotationNumber}</span>
                    <StatusBadge status={q.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
