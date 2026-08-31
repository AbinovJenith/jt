'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { DataTable } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { formatDate } from '@/lib/utils';
import { Plus, Search } from 'lucide-react';

export default function CustomersPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () =>
      api.get('/customers', { params: { page, limit: 20, search: search || undefined } })
         .then(r => r.data),
  });

  const columns = [
    {
      key: 'companyName',
      header: 'Company',
      render: (v: string, row: any) => (
        <div>
          <p className="font-medium text-gray-900">{v}</p>
          <p className="text-xs text-gray-500">{row.contactName}</p>
        </div>
      ),
    },
    { key: 'email', header: 'Email', render: (v: string) => <span className="text-gray-600">{v}</span> },
    { key: 'phone', header: 'Phone', render: (v: string) => <span className="text-gray-600">{v ?? '—'}</span> },
    {
      key: '_count',
      header: 'Orders',
      render: (v: any) => <span className="text-gray-600">{v?.orders ?? 0}</span>,
    },
    {
      key: 'createdAt',
      header: 'Since',
      render: (v: string) => <span className="text-gray-500 text-xs">{formatDate(v)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.meta?.total ?? 0} customers</p>
        </div>
        <button
          onClick={() => router.push('/customers/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by company, email..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          onRowClick={(row: any) => router.push(`/customers/${row.id}`)}
        />

        <div className="px-4 pb-4">
          <Pagination page={page} totalPages={data?.meta?.totalPages ?? 1} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
}
