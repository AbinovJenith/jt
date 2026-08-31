'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
});
type Form = z.infer<typeof schema>;

export default function MyProfilePage() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => api.get('/portal/profile').then((r) => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (data) reset({ firstName: data.firstName, lastName: data.lastName, phone: data.phone ?? '' });
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: Form) => api.put('/portal/profile', values).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-profile'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  if (isLoading) return <div className="animate-pulse h-64 bg-white rounded-xl border border-gray-200" />;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="mb-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email</p>
          <p className="text-sm text-gray-900">{data?.email}</p>
        </div>
        {data?.customer?.companyName && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Company</p>
            <p className="text-sm text-gray-900">{data.customer.companyName}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Account Type</p>
          <span className="inline-block text-xs font-semibold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
            {data?.role}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Edit Details</h2>
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input {...register('firstName')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input {...register('lastName')} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input {...register('phone')} placeholder="+91 98765 43210" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>
          )}
          {saved && <p className="text-sm text-green-600">Profile saved successfully.</p>}

          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm disabled:opacity-50 transition-colors"
          >
            {mutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
