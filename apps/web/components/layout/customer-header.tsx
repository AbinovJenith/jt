'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { ShoppingCart, Package, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'Catalog',   href: '/catalog',     icon: Package },
  { label: 'My Orders', href: '/my-orders',   icon: ShoppingCart },
  { label: 'Profile',   href: '/my-profile',  icon: User },
];

export function CustomerHeader({ session }: { session: any }) {
  const pathname = usePathname();
  const name = session?.user?.name ?? session?.user?.email ?? 'Customer';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/catalog" className="font-bold text-lg text-gray-900 tracking-tight">
          Jothi Traders
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{name}</span>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
