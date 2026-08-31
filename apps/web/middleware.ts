import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/** Routes accessible only by ADMIN */
const ADMIN_ONLY = [
  '/customers', '/suppliers', '/invoices', '/reports',
  '/purchase-orders', '/payments', '/audit',
];

/** Routes accessible by ADMIN + STAFF (but not CUSTOMER) */
const STAFF_ALLOWED = [
  '/dashboard', '/products', '/categories', '/inventory',
  '/rfq', '/quotations', '/orders', '/attributes',
];

/** Routes exclusively for the CUSTOMER portal */
const CUSTOMER_PORTAL = ['/catalog', '/my-orders', '/my-profile', '/checkout'];

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const path = req.nextUrl.pathname;

    if (!role) return NextResponse.next();

    if (role === 'CUSTOMER') {
      // Customers must not access admin or staff routes
      const blocked = [...ADMIN_ONLY, ...STAFF_ALLOWED].some((r) =>
        path === r || path.startsWith(r + '/'),
      );
      if (blocked) {
        return NextResponse.redirect(new URL('/catalog', req.url));
      }
    }

    if (role === 'STAFF') {
      // Staff must not access admin-only routes or customer portal
      const blocked = [...ADMIN_ONLY, ...CUSTOMER_PORTAL].some((r) =>
        path === r || path.startsWith(r + '/'),
      );
      if (blocked) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    if (role === 'ADMIN') {
      // Admins must not be stuck in customer portal
      const isPortal = CUSTOMER_PORTAL.some((r) => path === r || path.startsWith(r + '/'));
      if (isPortal) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Only let authenticated users through to protected routes
      authorized: ({ token }) => !!token,
    },
  },
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/products/:path*',
    '/categories/:path*',
    '/customers/:path*',
    '/suppliers/:path*',
    '/rfq/:path*',
    '/quotations/:path*',
    '/orders/:path*',
    '/purchase-orders/:path*',
    '/inventory/:path*',
    '/invoices/:path*',
    '/reports/:path*',
    '/audit/:path*',
    '/catalog/:path*',
    '/my-orders/:path*',
    '/my-profile/:path*',
    '/checkout/:path*',
  ],
};
