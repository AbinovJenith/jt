'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard, Package, Tag, Users, Truck, FileText, Receipt,
  ShoppingCart, Boxes, ClipboardList, BarChart3, Settings, PackageCheck,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Navigation definitions per role ──────────────────────────────────────────

const ADMIN_NAV = [
  { label: 'Dashboard',       href: '/dashboard',       icon: LayoutDashboard },
  { label: 'Products',        href: '/products',        icon: Package },
  { label: 'Categories',      href: '/categories',      icon: Tag },
  { label: 'Customers',       href: '/customers',       icon: Users },
  { label: 'Suppliers',       href: '/suppliers',       icon: Truck },
  { label: 'RFQ',             href: '/rfq',             icon: ClipboardList },
  { label: 'Quotations',      href: '/quotations',      icon: FileText },
  { label: 'Orders',          href: '/orders',          icon: ShoppingCart },
  { label: 'Purchase Orders', href: '/purchase-orders', icon: PackageCheck },
  { label: 'Inventory',       href: '/inventory',       icon: Boxes },
  { label: 'Invoices',        href: '/invoices',        icon: Receipt },
  { label: 'Reports',         href: '/reports',         icon: BarChart3 },
  { label: 'Audit Log',       href: '/audit',           icon: ShieldCheck },
];

const STAFF_NAV = [
  { label: 'Dashboard',  href: '/dashboard',  icon: LayoutDashboard },
  { label: 'Products',   href: '/products',   icon: Package },
  { label: 'Categories', href: '/categories', icon: Tag },
  { label: 'RFQ',        href: '/rfq',        icon: ClipboardList },
  { label: 'Quotations', href: '/quotations', icon: FileText },
  { label: 'Orders',     href: '/orders',     icon: ShoppingCart },
  { label: 'Inventory',  href: '/inventory',  icon: Boxes },
];

function navForRole(role?: string) {
  if (role === 'STAFF') return STAFF_NAV;
  return ADMIN_NAV; // ADMIN gets everything
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as string | undefined;
  const nav = navForRole(role);

  return (
    <aside className="w-60 bg-gray-900 flex flex-col shrink-0">
      {/* Logo + role badge */}
      <div className="px-5 py-5 border-b border-gray-800">
        <span className="text-white font-bold text-lg tracking-tight">Jothi Traders</span>
        <p className="text-gray-400 text-xs mt-0.5">Trading Platform</p>
        {role && (
          <span className={cn(
            'inline-block mt-2 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider',
            role === 'ADMIN' ? 'bg-red-700 text-red-100' : 'bg-blue-700 text-blue-100',
          )}>
            {role}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
