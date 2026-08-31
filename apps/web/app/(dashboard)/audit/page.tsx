'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Shield } from 'lucide-react';
import api from '@/lib/api';

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN: 'bg-purple-100 text-purple-700',
  LOGOUT: 'bg-gray-100 text-gray-600',
  STATUS_CHANGE: 'bg-yellow-100 text-yellow-700',
};

export default function AuditLogPage() {
  const [resource, setResource] = useState('');
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', resource, action, page],
    queryFn: () =>
      api.get('/audit', {
        params: {
          resource: resource || undefined,
          action: action || undefined,
          page,
          limit: 30,
        },
      }).then((r) => r.data),
  });

  const logs: any[] = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Shield className="w-6 h-6 text-gray-700" />
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Resource (e.g. Product, Order)"
          value={resource}
          onChange={(e) => { setResource(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Actions</option>
          {['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'STATUS_CHANGE'].map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">When</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Resource</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Resource ID</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-gray-400">No audit records found.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                    {format(new Date(log.createdAt), 'd MMM yyyy HH:mm')}
                  </td>
                  <td className="px-4 py-3">
                    {log.user ? (
                      <div>
                        <p className="font-medium text-gray-900">{log.user.firstName} {log.user.lastName}</p>
                        <p className="text-xs text-gray-400">{log.user.email} · {log.user.role}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">System</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${ACTION_COLOR[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-700">{log.resource}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-500 truncate max-w-[120px]">
                    {log.resourceId ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{log.ipAddress ?? '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>{meta.total} total records</span>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Prev
            </button>
            <span className="px-3 py-1.5">Page {page} of {meta.pages}</span>
            <button disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
