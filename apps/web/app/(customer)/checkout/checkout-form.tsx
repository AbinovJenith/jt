'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import QRCode from 'react-qr-code';
import { Copy, Check } from 'lucide-react';
import api from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'UPI';

// ── UPI helpers ───────────────────────────────────────────────────────────────

const UPI_VPA  = process.env.NEXT_PUBLIC_UPI_VPA  ?? 'jothitraders@upi';
const UPI_NAME = process.env.NEXT_PUBLIC_UPI_NAME ?? 'Jothi Traders';

function upiLink(amount: number, ref: string) {
  const params = new URLSearchParams({
    pa: UPI_VPA,
    pn: UPI_NAME,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: `Order ${ref}`,
  });
  return `upi://pay?${params.toString()}`;
}

// Intent links for specific apps (Android)
function gpayLink(amount: number, ref: string) {
  return `intent://pay?${new URLSearchParams({
    pa: UPI_VPA, pn: UPI_NAME, am: amount.toFixed(2), cu: 'INR', tn: `Order ${ref}`,
  })}&package=com.google.android.apps.nbu.paisa.user#Intent;scheme=upi;end`;
}
function phonepeLink(amount: number, ref: string) {
  return `intent://pay?${new URLSearchParams({
    pa: UPI_VPA, pn: UPI_NAME, am: amount.toFixed(2), cu: 'INR', tn: `Order ${ref}`,
  })}&package=com.phonepe.app#Intent;scheme=upi;end`;
}
function paytmLink(amount: number, ref: string) {
  return `intent://pay?${new URLSearchParams({
    pa: UPI_VPA, pn: UPI_NAME, am: amount.toFixed(2), cu: 'INR', tn: `Order ${ref}`,
  })}&package=net.one97.paytm#Intent;scheme=upi;end`;
}

// ── UPI Panel ─────────────────────────────────────────────────────────────────

function UpiPanel({ amount, orderRef }: { amount: number; orderRef: string }) {
  const [copied, setCopied] = useState(false);
  const link = upiLink(amount, orderRef);

  const copyVpa = () => {
    navigator.clipboard.writeText(UPI_VPA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* QR Code */}
      <div className="flex flex-col items-center gap-2">
        <div className="bg-white p-3 rounded-xl border border-gray-200 inline-block">
          <QRCode value={link} size={160} />
        </div>
        <p className="text-xs text-gray-500 text-center">
          Scan with <strong>GPay · PhonePe · Paytm</strong> or any UPI app
        </p>
      </div>

      {/* UPI VPA */}
      <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
        <span className="flex-1 text-sm font-mono text-gray-800 select-all">{UPI_VPA}</span>
        <button
          type="button"
          onClick={copyVpa}
          className="text-gray-400 hover:text-blue-600 transition-colors"
          title="Copy UPI ID"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* App shortcuts — intent links on Android, fallback to generic UPI on iOS */}
      <div>
        <p className="text-xs text-gray-500 mb-2 text-center">Or tap to open directly</p>
        <div className="grid grid-cols-3 gap-2">
          <a
            href={gpayLink(amount, orderRef)}
            className="flex flex-col items-center gap-1.5 border border-gray-200 rounded-xl p-3 hover:bg-gray-50 transition-colors"
          >
            {/* GPay logo — simple SVG */}
            <svg viewBox="0 0 48 48" className="w-8 h-8">
              <path fill="#4285F4" d="M24 9.5c3.5 0 6.5 1.3 8.8 3.4l6.6-6.6C35.4 2.4 30.1 0 24 0 14.8 0 7 5.6 3.3 13.7l7.7 6C12.8 13.3 17.9 9.5 24 9.5z"/>
              <path fill="#34A853" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.8-2.2 5.2-4.7 6.8l7.3 5.7C43.2 37 46.5 31.3 46.5 24.5z"/>
              <path fill="#FBBC05" d="M11 28.3c-.6-1.8-.9-3.7-.9-5.8s.3-4 .9-5.8l-7.7-6C1.2 14.2 0 19 0 24s1.2 9.8 3.3 13.7l7.7-6.4z"/>
              <path fill="#EA4335" d="M24 48c6.1 0 11.2-2 14.9-5.4l-7.3-5.7c-2 1.3-4.6 2.1-7.6 2.1-6.1 0-11.2-3.8-13.1-9.1l-7.7 6C7 42.4 14.8 48 24 48z"/>
            </svg>
            <span className="text-xs font-medium text-gray-700">GPay</span>
          </a>

          <a
            href={phonepeLink(amount, orderRef)}
            className="flex flex-col items-center gap-1.5 border border-gray-200 rounded-xl p-3 hover:bg-gray-50 transition-colors"
          >
            {/* PhonePe logo */}
            <svg viewBox="0 0 48 48" className="w-8 h-8">
              <rect width="48" height="48" rx="12" fill="#5f259f"/>
              <path d="M24 8C15.2 8 8 15.2 8 24s7.2 16 16 16c3.5 0 6.7-1.1 9.4-3l-2.8-3.5C28.7 34.8 26.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c4.1 0 7.7 2.1 9.9 5.2L38 14C35 10.3 29.8 8 24 8z" fill="white"/>
              <circle cx="30" cy="24" r="4" fill="white"/>
            </svg>
            <span className="text-xs font-medium text-gray-700">PhonePe</span>
          </a>

          <a
            href={paytmLink(amount, orderRef)}
            className="flex flex-col items-center gap-1.5 border border-gray-200 rounded-xl p-3 hover:bg-gray-50 transition-colors"
          >
            {/* Paytm logo */}
            <svg viewBox="0 0 48 48" className="w-8 h-8">
              <rect width="48" height="48" rx="12" fill="#00baf2"/>
              <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">Paytm</text>
            </svg>
            <span className="text-xs font-medium text-gray-700">Paytm</span>
          </a>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Amount: <strong className="text-gray-700">₹{amount.toLocaleString('en-IN')}</strong> · Pay to <strong className="text-gray-700">{UPI_NAME}</strong>
      </p>
    </div>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; desc: string }[] = [
  { value: 'UPI',           label: 'UPI',                   desc: 'GPay · PhonePe · Paytm · any UPI app' },
  { value: 'COD',           label: 'Cash on Delivery',       desc: 'Pay when your order arrives' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer / NEFT',   desc: 'Direct transfer to our account' },
];

export default function CheckoutForm() {
  const params = useSearchParams();

  const variantId  = params.get('variantId') ?? '';
  const productName = params.get('name') ?? 'Product';
  const unitPrice  = Number(params.get('price') ?? '0');

  const [qty, setQty]                   = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [notes, setNotes]               = useState('');
  const [upiDone, setUpiDone]           = useState(false);  // customer confirmed UPI payment
  const [error, setError]               = useState('');
  const [orderRef]                      = useState(() => `REF-${Date.now().toString(36).toUpperCase()}`);

  const totalAmount = qty * unitPrice;

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/portal/orders', {
        items: [{ variantId, qty, unitPrice }],
        notes: [
          `Payment method: ${paymentMethod}`,
          paymentMethod === 'UPI' ? `UPI ref: ${orderRef}` : '',
          notes,
        ].filter(Boolean).join(' | ') || undefined,
      }).then((r) => r.data),
    onError: (err: any) => setError(err.message ?? 'Failed to place order'),
  });

  if (!variantId) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No product selected.</p>
        <a href="/catalog" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Browse catalog</a>
      </div>
    );
  }

  if (mutation.isSuccess) {
    const orderNumber = mutation.data?.data?.orderNumber;
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Order Placed!</h2>
        {orderNumber && <p className="text-sm font-mono text-blue-600 mb-2">{orderNumber}</p>}
        <p className="text-gray-500 text-sm mb-6">
          {paymentMethod === 'UPI'
            ? "We'll confirm your order once the UPI payment is received."
            : "We've received your order and will process it shortly."}
        </p>
        <a href="/my-orders" className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          View My Orders
        </a>
      </div>
    );
  }

  const canPlace = paymentMethod !== 'UPI' || upiDone;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Order summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="font-semibold text-gray-800 mb-4">Order Summary</h2>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-700">{productName}</span>
          <span>₹{unitPrice.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm text-gray-700">Qty:</label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold">
          <span>Total</span>
          <span>₹{totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Payment method selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="font-semibold text-gray-800 mb-4">Payment Method</h2>
        <div className="space-y-2 mb-4">
          {PAYMENT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 cursor-pointer rounded-lg border-2 px-4 py-3 transition-colors ${
                paymentMethod === opt.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={opt.value}
                checked={paymentMethod === opt.value}
                onChange={() => { setPaymentMethod(opt.value); setUpiDone(false); }}
                className="mt-0.5 accent-blue-600"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{opt.label}</p>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </div>
            </label>
          ))}
        </div>

        {/* UPI panel — shown only when UPI is selected */}
        {paymentMethod === 'UPI' && (
          <div className="border-t border-gray-100 pt-4">
            <UpiPanel amount={totalAmount} orderRef={orderRef} />

            {/* Confirmation checkbox */}
            <label className="flex items-start gap-2.5 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={upiDone}
                onChange={(e) => setUpiDone(e.target.checked)}
                className="mt-0.5 accent-blue-600"
              />
              <span className="text-sm text-gray-700">
                I've completed the UPI payment of{' '}
                <strong>₹{totalAmount.toLocaleString('en-IN')}</strong>
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Any special instructions..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <button
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !canPlace}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-sm disabled:opacity-50 transition-colors"
      >
        {mutation.isPending
          ? 'Placing Order...'
          : paymentMethod === 'UPI' && !upiDone
          ? 'Complete UPI payment above first'
          : `Place Order — ₹${totalAmount.toLocaleString('en-IN')}`}
      </button>
    </div>
  );
}
