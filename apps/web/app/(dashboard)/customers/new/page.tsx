'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

const schema = z.object({
  companyName: z.string().min(2),
  contactName: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  gstNumber: z.string().optional(),
  creditLimit: z.coerce.number().optional(),
  creditTerms: z.coerce.number().optional(),
  notes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

function Field({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function NewCustomerPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const create = useMutation({
    mutationFn: (data: Form) => api.post('/customers', data),
    onSuccess: (res) => router.push(`/customers/${res.data.data.id}`),
  });

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Add Customer</h1>
      </div>

      <form onSubmit={handleSubmit(d => create.mutate(d))} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Company Name *" error={errors.companyName?.message}>
              <input {...register('companyName')} className={inputCls} />
            </Field>
          </div>
          <Field label="Contact Name">
            <input {...register('contactName')} className={inputCls} />
          </Field>
          <Field label="Email *" error={errors.email?.message}>
            <input {...register('email')} type="email" className={inputCls} />
          </Field>
          <Field label="Phone">
            <input {...register('phone')} className={inputCls} />
          </Field>
          <Field label="GST Number">
            <input {...register('gstNumber')} className={`${inputCls} font-mono`} placeholder="33AABCA1234B1Z1" />
          </Field>
          <Field label="Credit Limit (₹)">
            <input {...register('creditLimit')} type="number" className={inputCls} placeholder="500000" />
          </Field>
          <Field label="Payment Terms (days)">
            <input {...register('creditTerms')} type="number" className={inputCls} placeholder="30" />
          </Field>
          <div className="col-span-2">
            <Field label="Notes">
              <textarea {...register('notes')} rows={3} className={`${inputCls} resize-none`} />
            </Field>
          </div>
        </div>

        {create.error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{(create.error as Error).message}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={create.isPending} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {create.isPending ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}
