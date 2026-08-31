'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, ShoppingCart } from 'lucide-react';
import api from '@/lib/api';

export default function CatalogPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['catalog', search, page],
    queryFn: () =>
      api.get('/portal/catalog', { params: { search: search || undefined, page, limit: 12 } })
        .then((r) => r.data),
  });

  const products: any[] = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 h-52 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500 py-16">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => {
            const price = p.variants?.[0]?.supplierProducts?.[0]?.basePrice;
            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div>
                  <span className="text-xs text-blue-600 font-medium">{p.category?.name}</span>
                  <h3 className="font-semibold text-gray-900 mt-0.5">{p.name}</h3>
                  {p.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
                  )}
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div>
                    {price != null ? (
                      <span className="text-lg font-bold text-gray-900">
                        ₹{Number(price).toLocaleString('en-IN')}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Price on request</span>
                    )}
                  </div>
                  <a
                    href={`/checkout?variantId=${p.variants?.[0]?.id}&name=${encodeURIComponent(p.name)}&price=${price ?? 0}`}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Order
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {meta.pages}
          </span>
          <button
            disabled={page >= meta.pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
