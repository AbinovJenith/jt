'use client';

import { useQuery } from '@tanstack/react-query';
import { ShoppingCart } from 'lucide-react';
import { format } from 'date-fns';
import api from '@/lib/api';

const STATUS_COLOR: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function MyOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/portal/orders').then((r) => r.data),
  });

  const orders: any[] = data?.data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 h-24 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No orders yet.</p>
          <a href="/catalog" className="mt-3 inline-block text-sm text-blue-600 hover:underline">
            Browse catalog
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {format(new Date(order.createdAt), 'd MMM yyyy')} •{' '}
                    {order.items?.length ?? 0} item(s)
                  </p>
                  <ul className="mt-2 space-y-0.5">
                    {order.items?.slice(0, 2).map((item: any, i: number) => (
                      <li key={i} className="text-xs text-gray-600">
                        {item.variant?.product?.name} — {item.variant?.name} × {item.qty}
                      </li>
                    ))}
                    {(order.items?.length ?? 0) > 2 && (
                      <li className="text-xs text-gray-400">+{order.items.length - 2} more</li>
                    )}
                  </ul>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-gray-900">
                    ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                  </p>
                  {order.invoices?.[0] && (
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      order.invoices[0].status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      Invoice: {order.invoices[0].status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
