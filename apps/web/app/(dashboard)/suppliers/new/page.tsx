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
  panNumber: z.string().optional(),
  notes: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function NewSupplierPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const create = useMutation({
    mutationFn: (data: Form) => api.post('/suppliers', data),
    onSuccess: (res) => router.push(`/suppliers/${res.data.data.id}`),
  });

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Add Supplier</h1>
      </div>

      <form onSubmit={handleSubmit(d => create.mutate(d))} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
            <input {...register('companyName')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.companyName && <p className="text-xs text-red-600 mt-1">{errors.companyName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
            <input {...register('contactName')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input {...register('email')} type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...register('phone')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
            <input {...register('gstNumber')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="29AABCB5678C1Z3" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
            <input {...register('panNumber')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea {...register('notes')} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>

        {create.error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{(create.error as Error).message}</p>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting || create.isPending} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {create.isPending ? 'Saving...' : 'Save Supplier'}
          </button>
        </div>
      </form>
    </div>
  );
}
