'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type PurchaseType = 'self' | 'org';

const baseSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
  companyName: z.string().optional(),
});

const schema = baseSchema.refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type Form = z.infer<typeof schema>;

const INPUT = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

export default function RegisterPage() {
  const router = useRouter();
  const [purchaseType, setPurchaseType] = useState<PurchaseType>('self');
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    // Require company name when purchasing for an org
    if (purchaseType === 'org' && !data.companyName?.trim()) {
      setFieldError('companyName', { message: 'Company name is required for organisation accounts' });
      return;
    }

    setError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register-customer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || undefined,
            companyName:
              purchaseType === 'org' ? data.companyName : undefined,
            password: data.password,
          }),
        },
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.message ?? 'Registration failed');
      }

      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) throw new Error(result.error);
      router.push('/catalog');
    } catch (err: any) {
      setError(err.message ?? 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="text-sm text-gray-500 mt-1">Join Jothi Traders as a customer</p>
          </div>

          {/* Purchase type toggle */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 mb-2">I am purchasing for</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPurchaseType('self')}
                className={cn(
                  'flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-medium transition-colors',
                  purchaseType === 'self'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300',
                )}
              >
                <User className="w-4 h-4" />
                Myself
              </button>
              <button
                type="button"
                onClick={() => setPurchaseType('org')}
                className={cn(
                  'flex items-center justify-center gap-2 py-3 rounded-lg border-2 text-sm font-medium transition-colors',
                  purchaseType === 'org'
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300',
                )}
              >
                <Building2 className="w-4 h-4" />
                An Organisation
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Company name — only shown for org */}
            {purchaseType === 'org' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company / Organisation Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('companyName')}
                  placeholder="Acme Industries Pvt Ltd"
                  className={cn(INPUT, errors.companyName && 'border-red-400 focus:ring-red-400')}
                />
                {errors.companyName && (
                  <p className="text-xs text-red-600 mt-1">{errors.companyName.message}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input {...register('firstName')} className={INPUT} />
                {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input {...register('lastName')} className={INPUT} />
                {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input {...register('email')} type="email" autoComplete="email" className={INPUT} />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input {...register('phone')} type="tel" placeholder="+91 98765 43210" className={INPUT} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input {...register('password')} type="password" autoComplete="new-password" className={INPUT} />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input {...register('confirmPassword')} type="password" autoComplete="new-password" className={INPUT} />
              {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <a href="/login" className="text-blue-600 hover:underline">Sign in</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
