'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.get(`/customers/${id}`).then(r => r.data.data),
  });

  if (isLoading) return <div className="p-6 text-sm text-gray-400">Loading...</div>;
  if (!data) return null;

  const addr = data.address as any;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{data.companyName}</h1>
          <p className="text-sm text-gray-500">{data.contactName}</p>
        </div>
        <Link
          href={`/rfq/new?customerId=${id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Create RFQ
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-700">{data.email}</span>
            </div>
            {data.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{data.phone}</span>
              </div>
            )}
            {addr && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="text-gray-600">{addr.street}, {addr.city}, {addr.state} {addr.pincode}</span>
              </div>
            )}
          </div>
          <div className="pt-3 border-t border-gray-100 space-y-2">
            {data.gstNumber && <p className="text-xs text-gray-500">GST: <span className="font-mono text-gray-700">{data.gstNumber}</span></p>}
            {data.creditLimit && (
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                <p className="text-xs text-gray-600">Credit Limit: <span className="font-semibold text-gray-900">{formatCurrency(data.creditLimit)}</span></p>
              </div>
            )}
            {data.creditTerms && <p className="text-xs text-gray-500">Payment Terms: {data.creditTerms} days</p>}
          </div>
        </div>

        {/* Activity */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Orders */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Recent Orders ({data._count?.orders ?? 0})</h2>
              <Link href={`/orders?customerId=${id}`} className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            {data.orders?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No orders yet</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {data.orders?.map((o: any) => (
                    <tr key={o.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer">
                      <td className="py-3 px-5">
                        <Link href={`/orders/${o.id}`} className="font-mono font-medium text-blue-600">{o.orderNumber}</Link>
                      </td>
                      <td className="py-3 px-5"><StatusBadge status={o.status} /></td>
                      <td className="py-3 px-5 text-right font-medium">{formatCurrency(o.totalAmount)}</td>
                      <td className="py-3 px-5 text-right text-xs text-gray-400">{formatDate(o.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Recent RFQs */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Recent RFQs ({data._count?.rfqs ?? 0})</h2>
              <Link href={`/rfq?customerId=${id}`} className="text-xs text-blue-600 hover:underline">View all</Link>
            </div>
            {data.rfqs?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No RFQs yet</p>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  {data.rfqs?.map((r: any) => (
                    <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="py-3 px-5">
                        <Link href={`/rfq/${r.id}`} className="font-mono font-medium text-blue-600">{r.rfqNumber}</Link>
                      </td>
                      <td className="py-3 px-5"><StatusBadge status={r.status} /></td>
                      <td className="py-3 px-5 text-right text-xs text-gray-400">{formatDate(r.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
