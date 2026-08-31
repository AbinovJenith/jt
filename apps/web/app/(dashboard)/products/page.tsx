'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { DataTable } from '@/components/shared/data-table';
import { Pagination } from '@/components/shared/pagination';
import { StatusBadge } from '@/components/shared/status-badge';
import { Plus, Search } from 'lucide-react';

export default function ProductsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search],
    queryFn: () =>
      api.get('/products', { params: { page, limit: 20, search: search || undefined } })
         .then(r => r.data),
  });

  const columns = [
    {
      key: 'name',
      header: 'Product',
      render: (v: string, row: any) => (
        <div>
          <p className="font-medium text-gray-900">{v}</p>
          <p className="text-xs text-gray-500">{row.category?.name}</p>
        </div>
      ),
    },
    {
      key: '_count',
      header: 'Variants',
      render: (v: any) => <span className="text-gray-600">{v?.variants ?? 0}</span>,
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (v: boolean) => <StatusBadge status={v ? 'ACTIVE' : 'INACTIVE'} />,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.meta?.total ?? 0} products</p>
        </div>
        <button
          onClick={() => router.push('/products/new')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products, SKU..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          onRowClick={(row: any) => router.push(`/products/${row.id}`)}
        />

        <div className="px-4 pb-4">
          <Pagination
            page={page}
            totalPages={data?.meta?.totalPages ?? 1}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
