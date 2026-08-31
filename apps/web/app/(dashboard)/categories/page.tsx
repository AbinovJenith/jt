'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ChevronRight, FolderOpen, Folder, Plus, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function CategoryNode({ cat, depth = 0, onEdit, onDelete }: any) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = cat.children?.length > 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 group',
          depth > 0 && 'ml-6',
        )}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400"
        >
          {hasChildren
            ? expanded ? <FolderOpen className="w-4 h-4 text-blue-500" /> : <Folder className="w-4 h-4 text-blue-500" />
            : <div className="w-4 h-4" />}
        </button>
        <span className="text-sm font-medium text-gray-900 flex-1">{cat.name}</span>
        <span className="text-xs text-gray-400 mr-3">{cat._count?.products ?? 0} products</span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
          <button onClick={() => onEdit(cat)} className="p-1 hover:bg-gray-200 rounded text-gray-500"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(cat.id)} className="p-1 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      {expanded && hasChildren && cat.children.map((child: any) => (
        <CategoryNode key={child.id} cat={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState<any>(null);
  const [form, setForm] = useState({ name: '', description: '', parentId: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.data),
  });

  const createMut = useMutation({
    mutationFn: (d: any) => editCat
      ? api.put(`/categories/${editCat.id}`, d)
      : api.post('/categories', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] });
      setShowForm(false);
      setEditCat(null);
      setForm({ name: '', description: '', parentId: '' });
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['categories'] }),
  });

  const handleEdit = (cat: any) => {
    setEditCat(cat);
    setForm({ name: cat.name, description: cat.description ?? '', parentId: cat.parentId ?? '' });
    setShowForm(true);
  };

  // Flatten categories for parent selector
  const flatCats: any[] = [];
  const flatten = (cats: any[], depth = 0) => {
    cats?.forEach(c => {
      flatCats.push({ ...c, depth });
      flatten(c.children ?? [], depth + 1);
    });
  };
  flatten(data ?? []);

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-0.5">Nested product category tree</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditCat(null); setForm({ name: '', description: '', parentId: '' }); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">{editCat ? 'Edit Category' : 'New Category'}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Parent Category</label>
              <select
                value={form.parentId}
                onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">None (root)</option>
                {flatCats.filter(c => c.id !== editCat?.id).map(c => (
                  <option key={c.id} value={c.id}>
                    {'— '.repeat(c.depth)}{c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button
              onClick={() => createMut.mutate({ name: form.name, description: form.description || undefined, parentId: form.parentId || undefined })}
              disabled={!form.name || createMut.isPending}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {createMut.isPending ? 'Saving...' : editCat ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Tree */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-9 bg-gray-100 rounded-lg animate-pulse" />)}
          </div>
        ) : data?.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No categories yet. Add one above.</p>
        ) : (
          data?.map((cat: any) => (
            <CategoryNode
              key={cat.id}
              cat={cat}
              onEdit={handleEdit}
              onDelete={(id: string) => {
                if (confirm('Deactivate this category?')) deleteMut.mutate(id);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
