'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month'>('month');

  const salesQuery = useQuery({
    queryKey: ['report-sales', from, to, groupBy],
    queryFn: () => api.get('/reports/sales', { params: { from, to, groupBy } }).then(r => r.data.data),
  });

  const inventoryQuery = useQuery({
    queryKey: ['report-inventory'],
    queryFn: () => api.get('/reports/inventory').then(r => r.data.data),
  });

  const customerQuery = useQuery({
    queryKey: ['report-customers'],
    queryFn: () => api.get('/reports/customers').then(r => r.data.data),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Reports</h1>

      {/* Sales Report */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Sales Report</h2>
          <div className="flex items-center gap-3">
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1" />
            <span className="text-gray-400 text-xs">to</span>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="text-xs border border-gray-200 rounded px-2 py-1" />
            <select value={groupBy} onChange={e => setGroupBy(e.target.value as any)} className="text-xs border border-gray-200 rounded px-2 py-1">
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={salesQuery.data ?? []}>
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: any) => formatCurrency(v)} />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Customers */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Top Customers</h2>
          <div className="space-y-3">
            {customerQuery.data?.slice(0, 8).map((c: any) => (
              <div key={c.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.companyName}</p>
                  <p className="text-xs text-gray-400">{c.orderCount} orders</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">{formatCurrency(c.totalValue)}</span>
              </div>
            ))}
            {!customerQuery.data?.length && <p className="text-sm text-gray-400 text-center py-4">No data</p>}
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Inventory Summary</h2>
          <div className="space-y-2">
            {inventoryQuery.data?.slice(0, 8).map((item: any) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900">{item.variant?.product?.name}</p>
                  <p className="text-xs text-gray-400">{item.variant?.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{item.qtyAvailable} avail</p>
                  <p className="text-xs text-gray-400">{item.qtyOnHand} on hand</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
