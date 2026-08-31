'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { DataTable } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';

const STATUSES = ['PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'];

export default function InvoicesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page, status],
    queryFn: () =>
      api.get('/invoices', { params: { page, limit: 20, status: status || undefined } })
        .then(r => r.data),
  });

  const columns = [
    { key: 'invoiceNumber', header: 'Invoice #', render: (v: string) => <span className="font-mono font-medium text-gray-900">{v}</span> },
    { key: 'order', header: 'Order', render: (_: any, row: any) => <span className="font-mono text-xs text-blue-600">{row.order?.orderNumber ?? '—'}</span> },
    { key: 'status', header: 'Status', render: (v: string) => <StatusBadge status={v} /> },
    { key: 'totalAmount', header: 'Amount', render: (v: string) => <span className="font-semibold">{formatCurrency(v)}</span> },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (v: string, row: any) => (
        <span className={`text-xs ${row.status === 'OVERDUE' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
          {formatDate(v)}
        </span>
      ),
    },
    { key: 'createdAt', header: 'Issued', render: (v: string) => <span className="text-gray-400 text-xs">{formatDate(v)}</span> },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Invoices</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data?.meta?.total ?? 0} invoices</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex gap-2 flex-wrap">
          <button onClick={() => setStatus('')} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${!status ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>All</button>
          {STATUSES.map(s => (
            <button key={s} onClick={() => setStatus(s)} className={`px-3 py-1.5 text-xs font-medium rounded-lg ${status === s ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          onRowClick={(row: any) => router.push(`/invoices/${row.id}`)}
        />
        <div className="px-4 pb-4">
          <Pagination page={page} totalPages={data?.meta?.totalPages ?? 1} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
