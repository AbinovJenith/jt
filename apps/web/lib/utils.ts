import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string, currency = 'INR') {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy') {
  return format(new Date(date), fmt);
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'dd MMM yyyy, HH:mm');
}

export const STATUS_COLORS: Record<string, string> = {
  // Orders
  CONFIRMED:         'bg-blue-100 text-blue-800',
  PROCESSING:        'bg-yellow-100 text-yellow-800',
  PARTIALLY_SHIPPED: 'bg-orange-100 text-orange-800',
  SHIPPED:           'bg-purple-100 text-purple-800',
  DELIVERED:         'bg-green-100 text-green-800',
  CANCELLED:         'bg-red-100 text-red-800',
  RETURNED:          'bg-gray-100 text-gray-800',
  // RFQ
  DRAFT:             'bg-gray-100 text-gray-700',
  SUBMITTED:         'bg-blue-100 text-blue-800',
  UNDER_REVIEW:      'bg-yellow-100 text-yellow-800',
  QUOTED:            'bg-green-100 text-green-800',
  EXPIRED:           'bg-red-100 text-red-700',
  // Quotation
  SENT:              'bg-blue-100 text-blue-800',
  ACCEPTED:          'bg-green-100 text-green-800',
  REJECTED:          'bg-red-100 text-red-800',
  REVISED:           'bg-purple-100 text-purple-800',
  // Invoice
  PENDING:           'bg-yellow-100 text-yellow-800',
  PARTIALLY_PAID:    'bg-orange-100 text-orange-800',
  PAID:              'bg-green-100 text-green-800',
  OVERDUE:           'bg-red-100 text-red-800',
  // Shipment
  PREPARING:         'bg-gray-100 text-gray-700',
  DISPATCHED:        'bg-blue-100 text-blue-800',
  IN_TRANSIT:        'bg-purple-100 text-purple-800',
  OUT_FOR_DELIVERY:  'bg-orange-100 text-orange-800',
};

export function statusColor(status: string): string {
  return STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-700';
}
