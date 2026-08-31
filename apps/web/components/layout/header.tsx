'use client';

import { signOut } from 'next-auth/react';
import { Session } from 'next-auth';
import { Bell, ChevronDown, LogOut } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  session: Session;
}

export function Header({ session }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const user = session.user;
  const initials = `${user?.name?.[0] ?? user?.email?.[0] ?? '?'}`.toUpperCase();

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div />

      <div className="flex items-center gap-4">
        <button className="relative text-gray-400 hover:text-gray-600">
          <Bell className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold">
              {initials}
            </div>
            <span className="font-medium">{user?.name ?? user?.email}</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
