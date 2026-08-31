'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatCurrency, formatDate, statusColor } from '@/lib/utils';
import {
  Users, Truck, Package, ClipboardList, FileText,
  ShoppingCart, Receipt, TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: summary } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data.data),
  });

  const { data: chart } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: () => api.get('/dashboard/revenue-chart').then(r => r.data.data),
  });

  const stats = summary?.stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back. Here's what's happening.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Customers" value={stats?.totalCustomers ?? '—'} icon={Users} color="bg-blue-500" />
        <StatCard label="Suppliers" value={stats?.totalSuppliers ?? '—'} icon={Truck} color="bg-purple-500" />
        <StatCard label="Products" value={stats?.totalProducts ?? '—'} icon={Package} color="bg-indigo-500" />
        <StatCard label="Open RFQs" value={stats?.openRFQs ?? '—'} icon={ClipboardList} color="bg-yellow-500" />
        <StatCard label="Pending Quotations" value={stats?.pendingQuotations ?? '—'} icon={FileText} color="bg-orange-500" />
        <StatCard label="Active Orders" value={stats?.activeOrders ?? '—'} icon={ShoppingCart} color="bg-green-500" />
        <StatCard label="Pending Invoices" value={stats?.pendingInvoices ?? '—'} icon={Receipt} color="bg-red-500" />
        <StatCard label="Revenue (MTD)" value={formatCurrency(stats?.revenueThisMonth ?? 0)} icon={TrendingUp} color="bg-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Revenue (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chart ?? []}>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Recent Orders</h2>
          <div className="space-y-3">
            {summary?.recentOrders?.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{order.customer?.companyName}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                </div>
              </div>
            ))}
            {!summary?.recentOrders?.length && (
              <p className="text-sm text-gray-400 text-center py-4">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
