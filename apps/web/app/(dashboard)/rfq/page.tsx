'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { DataTable } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate } from '@/lib/utils';
import { Plus } from 'lucide-react';

const STATUSES = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUOTED', 'EXPIRED', 'CANCELLED'];

export default function RFQPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['rfq', page, status],
    queryFn: () =>
      api.get('/rfq', { params: { page, limit: 20, status: status || undefined } })
         .then(r => r.data),
  });

  const columns = [
    {
      key: 'rfqNumber',
      header: 'RFQ #',
      render: (v: string) => <span className="font-mono font-medium text-gray-900">{v}</span>,
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (_: any, row: any) => <span className="text-gray-700">{row.customer?.companyName}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (v: string) => <StatusBadge status={v} />,
    },
    {
      key: '_count',
      header: 'Items / Quotes',
      render: (v: any) => <span className="text-gray-500">{v?.items ?? 0} items · {v?.quotations ?? 0} quotes</span>,
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (v: string) => <span className="text-gray-500 text-xs">{formatDate(v)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Request for Quotes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.meta?.total ?? 0} RFQs</p>
        </div>
        <button
          onClick={() => router.push('/rfq/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New RFQ
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex gap-2 flex-wrap">
          <button
            onClick={() => setStatus('')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg ${!status ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            All
          </button>
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg ${status === s ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          onRowClick={(row: any) => router.push(`/rfq/${row.id}`)}
        />

        <div className="px-4 pb-4">
          <Pagination page={page} totalPages={data?.meta?.totalPages ?? 1} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
