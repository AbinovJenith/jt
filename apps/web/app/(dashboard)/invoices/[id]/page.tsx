'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [showPayForm, setShowPayForm] = useState(false);
  const [payForm, setPayForm] = useState({ amount: '', method: 'BANK_TRANSFER', reference: '', notes: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api.get(`/invoices/${id}`).then(r => r.data.data),
  });

  const recordPayment = useMutation({
    mutationFn: () => api.post(`/invoices/${id}/payments`, {
      amount: Number(payForm.amount),
      method: payForm.method,
      reference: payForm.reference || undefined,
      notes: payForm.notes || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice', id] });
      setShowPayForm(false);
      setPayForm({ amount: '', method: 'BANK_TRANSFER', reference: '', notes: '' });
    },
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Loading...</div>;
  if (!data) return null;

  const totalPaid = data.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) ?? 0;
  const outstanding = Number(data.totalAmount) - totalPaid;

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{data.invoiceNumber}</h1>
          <p className="text-sm text-gray-500">
            Order: <Link href={`/orders/${data.orderId}`} className="text-blue-600 hover:underline font-mono">{data.order?.orderNumber}</Link>
            {' · '}Due: {formatDate(data.dueDate)}
          </p>
        </div>
        <StatusBadge status={data.status} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Invoice Total', value: formatCurrency(data.totalAmount), color: 'text-gray-900' },
          { label: 'Amount Paid', value: formatCurrency(totalPaid), color: 'text-green-700' },
          { label: 'Outstanding', value: formatCurrency(outstanding), color: outstanding > 0 ? 'text-red-600' : 'text-green-700' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">{c.label}</p>
            <p className={`text-lg font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Payments ({data.payments?.length ?? 0})</h2>
          {data.status !== 'PAID' && data.status !== 'CANCELLED' && (
            <button
              onClick={() => setShowPayForm(!showPayForm)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4" />
              Record Payment
            </button>
          )}
        </div>

        {/* Payment form */}
        {showPayForm && (
          <div className="px-5 py-4 bg-blue-50 border-b border-blue-100 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Amount (₹) *</label>
              <input
                type="number"
                value={payForm.amount}
                onChange={e => setPayForm(f => ({ ...f, amount: e.target.value }))}
                placeholder={String(outstanding)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Method *</label>
              <select
                value={payForm.method}
                onChange={e => setPayForm(f => ({ ...f, method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {['BANK_TRANSFER', 'CHEQUE', 'CASH', 'UPI', 'CREDIT_CARD', 'ONLINE'].map(m => (
                  <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Reference / UTR</label>
              <input
                value={payForm.reference}
                onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Notes</label>
              <input
                value={payForm.notes}
                onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <button onClick={() => setShowPayForm(false)} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-white">Cancel</button>
              <button
                onClick={() => recordPayment.mutate()}
                disabled={!payForm.amount || recordPayment.isPending}
                className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {recordPayment.isPending ? 'Saving...' : 'Record Payment'}
              </button>
            </div>
          </div>
        )}

        {data.payments?.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No payments recorded</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs text-gray-500 font-semibold py-3 px-5">Date</th>
                <th className="text-left text-xs text-gray-500 font-semibold py-3 px-5">Method</th>
                <th className="text-left text-xs text-gray-500 font-semibold py-3 px-5">Reference</th>
                <th className="text-right text-xs text-gray-500 font-semibold py-3 px-5">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.payments?.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-100 last:border-0">
                  <td className="py-3 px-5 text-gray-600">{formatDate(p.paidAt)}</td>
                  <td className="py-3 px-5 text-gray-600">{p.method.replace(/_/g, ' ')}</td>
                  <td className="py-3 px-5 text-gray-400 font-mono text-xs">{p.reference ?? '—'}</td>
                  <td className="py-3 px-5 text-right font-semibold text-green-700">{formatCurrency(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
