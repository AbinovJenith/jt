'use client';

import { Suspense } from 'react';
import CheckoutForm from './checkout-form';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-white rounded-xl border border-gray-200" />}>
      <CheckoutForm />
    </Suspense>
  );
}
