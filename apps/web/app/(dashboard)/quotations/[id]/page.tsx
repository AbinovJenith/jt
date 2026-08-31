'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

const TRANSITIONS: Record<string, { label: string; status: string; style: string }[]> = {
  DRAFT:    [{ label: 'Send to Customer', status: 'SENT', style: 'bg-blue-600 text-white hover:bg-blue-700' }],
  SENT:     [
    { label: 'Mark Accepted', status: 'ACCEPTED', style: 'bg-green-600 text-white hover:bg-green-700' },
    { label: 'Mark Rejected', status: 'REJECTED', style: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100' },
    { label: 'Revise', status: 'REVISED', style: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  ],
  REJECTED: [{ label: 'Revise', status: 'REVISED', style: 'bg-gray-100 text-gray-700 hover:bg-gray-200' }],
};

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['quotation', id],
    queryFn: () => api.get(`/quotations/${id}`).then(r => r.data.data),
  });

  const transition = useMutation({
    mutationFn: (status: string) => api.patch(`/quotations/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotation', id] }),
  });

  const convertToOrder = useMutation({
    mutationFn: () => api.post(`/quotations/${id}/convert-to-order`),
    onSuccess: (res) => router.push(`/orders/${res.data.data.id}`),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Loading...</div>;
  if (!data) return null;

  const actions = TRANSITIONS[data.status] ?? [];

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{data.quotationNumber}</h1>
          <p className="text-sm text-gray-500">
            {data.rfq?.customer?.companyName} · Valid until {formatDate(data.validUntil)}
          </p>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {/* Action buttons */}
      {(actions.length > 0 || data.status === 'ACCEPTED') && (
        <div className="flex gap-2 flex-wrap">
          {actions.map(a => (
            <button
              key={a.status}
              onClick={() => transition.mutate(a.status)}
              disabled={transition.isPending}
              className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 ${a.style}`}
            >
              {a.label}
            </button>
          ))}
          {data.status === 'ACCEPTED' && (
            <button
              onClick={() => convertToOrder.mutate()}
              disabled={convertToOrder.isPending}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              {convertToOrder.isPending ? 'Creating...' : 'Convert to Order'}
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Line Items */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Quoted Items</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs text-gray-500 font-semibold py-3 px-5">Product</th>
                <th className="text-right text-xs text-gray-500 font-semibold py-3 px-5">Qty</th>
                <th className="text-right text-xs text-gray-500 font-semibold py-3 px-5">Unit Price</th>
                <th className="text-right text-xs text-gray-500 font-semibold py-3 px-5">Disc%</th>
                <th className="text-right text-xs text-gray-500 font-semibold py-3 px-5">GST%</th>
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
                  <td className="py-3 px-5 text-right text-gray-700">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 px-5 text-right text-gray-500">{item.discount}%</td>
                  <td className="py-3 px-5 text-right text-gray-500">{item.gstRate}%</td>
                  <td className="py-3 px-5 text-right font-semibold text-gray-900">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 bg-gray-50">
                <td colSpan={4} />
                <td className="py-3 px-5 text-right text-xs text-gray-500 font-medium">Tax</td>
                <td className="py-3 px-5 text-right text-gray-700">{formatCurrency(data.taxAmount)}</td>
              </tr>
              <tr className="bg-gray-50">
                <td colSpan={4} />
                <td className="py-3 px-5 text-right text-sm font-bold text-gray-900">Total</td>
                <td className="py-3 px-5 text-right text-sm font-bold text-gray-900">{formatCurrency(data.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Side */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700">Details</h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">RFQ</span>
                <Link href={`/rfq/${data.rfqId}`} className="text-blue-600 font-mono hover:underline">
                  {data.rfq?.rfqNumber ?? data.rfqId.slice(0, 8)}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-700">{formatDate(data.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Valid Until</span>
                <span className="text-gray-700">{formatDate(data.validUntil)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Currency</span>
                <span className="text-gray-700">{data.currency}</span>
              </div>
            </div>
          </div>

          {data.notes && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Notes</h2>
              <p className="text-sm text-gray-600">{data.notes}</p>
            </div>
          )}
          {data.termsConditions && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Terms & Conditions</h2>
              <p className="text-sm text-gray-600">{data.termsConditions}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
