
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Truck,
  Search,
  Plus,
  Phone,
  Mail,
  MoreVertical,
  X,
} from 'lucide-react';

import { AppHeader } from '../components/common/AppHeader';
import { MainNavigation } from '../components/common/MainNavigation';
import { useCurrentProfile } from '../app/useCurrentProfile';

import {
  listSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  type SupplierInput,
} from '../lib/api/suppliers';

type Supplier = Awaited<ReturnType<typeof listSuppliers>>[number];

const emptyForm: SupplierInput = {
  name: '',
  contact_person: '',
  email: '',
  phone: '',
};

function Suppliers() {
  const queryClient = useQueryClient();
  const profile = useCurrentProfile();

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<SupplierInput>(emptyForm);

  const suppliersQuery = useQuery({
    queryKey: ['suppliers'],
    queryFn: listSuppliers,
  });

  const saveMutation = useMutation({
    mutationFn: ({
      supplierId,
      values,
    }: {
      supplierId: string | null;
      values: SupplierInput;
    }) => {
      return supplierId
        ? updateSupplier(supplierId, values)
        : createSupplier(values);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      closeForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });

  const suppliers = suppliersQuery.data ?? [];
  const isOwner = profile.data?.role === 'business_owner';

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.contact_person ?? '')
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  function closeForm() {
    setShowForm(false);
    setEditingSupplier(null);
    setForm(emptyForm);
    saveMutation.reset();
  }

  function openEditForm(supplier: Supplier) {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name,
      contact_person: supplier.contact_person ?? '',
      email: supplier.email ?? '',
      phone: supplier.phone ?? '',
    });
    setShowForm(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    saveMutation.mutate({
      supplierId: editingSupplier?.id ?? null,
      values: {
        name: form.name.trim(),
        contact_person: form.contact_person?.trim() || null,
        email: form.email?.trim() || null,
        phone: form.phone?.trim() || null,
      },
    });
  }

  function handleDelete(supplier: Supplier) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${supplier.name}?`,
    );

    if (confirmed) {
      deleteMutation.mutate(supplier.id);
    }
  }

  return (
    <>
      <AppHeader title="Suppliers" signedIn />

      <div className="app-layout">
        <MainNavigation />

        <main className="page-shell">
          <div className="min-h-screen bg-background p-6 md:p-8">

            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold text-primary">
                  Suppliers
                </h1>
                <p className="mt-2 text-sm text-gray-500">
                  Manage and view your business suppliers.
                </p>
              </div>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingSupplier(null);
                    setForm(emptyForm);
                    setShowForm(true);
                  }}
                  className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-[#244767]"
                >
                  <Plus size={18} />
                  Add Supplier
                </button>
              )}
            </div>

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-teal-50 p-3">
                  <Truck className="text-accent" size={26} />
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Total Suppliers
                  </p>
                  <h2 className="text-2xl font-bold text-primary">
                    {suppliers.length}
                  </h2>
                </div>
              </div>
            </div>

            {showForm && isOwner && (
              <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-primary">
                    {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                  </h2>

                  <button
                    type="button"
                    onClick={closeForm}
                    aria-label="Close supplier form"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Supplier name *
                    </label>
                    <input
                      required
                      maxLength={120}
                      value={form.name}
                      onChange={(event) =>
                        setForm({ ...form, name: event.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 p-3"
                      placeholder="Enter supplier name"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Contact person
                    </label>
                    <input
                      maxLength={120}
                      value={form.contact_person ?? ''}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          contact_person: event.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-gray-300 p-3"
                      placeholder="Enter contact person"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={form.email ?? ''}
                      onChange={(event) =>
                        setForm({ ...form, email: event.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 p-3"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Phone number
                    </label>
                    <input
                      type="tel"
                      value={form.phone ?? ''}
                      onChange={(event) =>
                        setForm({ ...form, phone: event.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 p-3"
                      placeholder="+27XXXXXXXXX"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Use the South African international format, e.g. +27123456789.
                    </p>
                  </div>

                  {saveMutation.isError && (
                    <p className="text-sm text-red-600" role="alert">
                      {saveMutation.error.message}
                    </p>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={saveMutation.isPending}
                      className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {saveMutation.isPending
                        ? 'Saving...'
                        : editingSupplier
                          ? 'Save Changes'
                          : 'Create Supplier'}
                    </button>

                    <button
                      type="button"
                      onClick={closeForm}
                      className="rounded-lg border border-gray-300 px-5 py-3 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="mb-6">
              <div className="relative max-w-md">
                <Search
                  className="absolute left-4 top-3.5 text-gray-400"
                  size={19}
                />

                <input
                  type="search"
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 outline-none focus:border-accent"
                />
              </div>
            </div>

            {suppliersQuery.isLoading && (
              <div className="rounded-xl bg-white p-10 text-center">
                Loading suppliers...
              </div>
            )}

            {suppliersQuery.isError && (
              <div className="rounded-xl bg-white p-10 text-center">
                <p className="text-red-600">
                  Unable to load suppliers: {suppliersQuery.error.message}
                </p>
                <button
                  type="button"
                  onClick={() => void suppliersQuery.refetch()}
                  className="mt-3 text-sm font-semibold text-primary underline"
                >
                  Try again
                </button>
              </div>
            )}

            {!suppliersQuery.isLoading && !suppliersQuery.isError && (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-5">
                  <h2 className="font-semibold text-primary">
                    Supplier Directory
                  </h2>
                </div>

                {filteredSuppliers.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <Truck size={32} className="mx-auto mb-3 text-gray-400" />
                    <h3 className="font-semibold text-primary">
                      {suppliers.length === 0
                        ? 'No suppliers yet'
                        : 'No suppliers found'}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      {suppliers.length === 0
                        ? 'Add your first supplier to get started.'
                        : 'Try another search term.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500">
                        <tr>
                          <th className="px-6 py-4 font-medium">Supplier</th>
                          <th className="px-6 py-4 font-medium">Contact Person</th>
                          <th className="px-6 py-4 font-medium">Phone</th>
                          <th className="px-6 py-4 font-medium">Email</th>
                          {isOwner && (
                            <th className="px-6 py-4 font-medium">Actions</th>
                          )}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-gray-100">
                        {filteredSuppliers.map((supplier) => (
                          <tr key={supplier.id} className="hover:bg-gray-50">
                            <td className="px-6 py-5 font-medium text-primary">
                              {supplier.name}
                            </td>

                            <td className="px-6 py-5 text-gray-600">
                              {supplier.contact_person || 'Not provided'}
                            </td>

                            <td className="px-6 py-5 text-gray-600">
                              <span className="flex items-center gap-2">
                                <Phone size={15} />
                                {supplier.phone || 'Not provided'}
                              </span>
                            </td>

                            <td className="px-6 py-5 text-gray-600">
                              <span className="flex items-center gap-2">
                                <Mail size={15} />
                                {supplier.email || 'Not provided'}
                              </span>
                            </td>

                            {isOwner && (
                              <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openEditForm(supplier)}
                                    className="rounded-lg px-3 py-2 text-sm text-primary hover:bg-gray-100"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDelete(supplier)}
                                    disabled={deleteMutation.isPending}
                                    aria-label={`Delete ${supplier.name}`}
                                    className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                                  >
                                    <MoreVertical size={19} />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {deleteMutation.isError && (
              <p className="mt-4 text-sm text-red-600" role="alert">
                {deleteMutation.error.message.includes('supplier_in_use')
                  ? 'This supplier is linked to active products and cannot be deleted.'
                  : `Unable to delete supplier: ${deleteMutation.error.message}`}
              </p>
            )}

          </div>
        </main>
      </div>
    </>
  );
}

export default Suppliers;

