
import { useState } from "react";
import {
  Truck,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  MoreVertical,
} from "lucide-react";

type Supplier = {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  location: string;
};

const sampleSuppliers: Supplier[] = [
  {
    id: 1,
    name: "Fresh Foods Wholesale",
    contact: "James Smith",
    email: "james@example.com",
    phone: "+27123456789",
    location: "Johannesburg",
  },
  {
    id: 2,
    name: "Metro Packaging",
    contact: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+27987654321",
    location: "Pretoria",
  },
  {
    id: 3,
    name: "Global Retail Supplies",
    contact: "David Brown",
    email: "david@example.com",
    phone: "+27821234567",
    location: "Sandton",
  },
];

function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");

  // Temporary role setting until authentication is connected.
  const userRole: "owner" | "staff_member" = "owner";

  const filteredSuppliers = sampleSuppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">

      {/* Page Heading */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">
            Suppliers
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Manage and view your business suppliers.
          </p>
        </div>

        {userRole === "owner" && (
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-[#244767]"
          >
            <Plus size={18} />
            Add Supplier
          </button>
        )}
      </div>

      {/* Supplier Summary */}
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
              {filteredSuppliers.length}
            </h2>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-4 top-3.5 text-gray-400"
            size={19}
          />

          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      {/* Supplier Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="font-semibold text-primary">
            Supplier Directory
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Supplier</th>
                <th className="px-6 py-4 font-medium">Contact Person</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Location</th>
                {userRole === "owner" && (
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
                    {supplier.contact}
                  </td>

                  <td className="px-6 py-5 text-gray-600">
                    <span className="flex items-center gap-2">
                      <Phone size={15} />
                      {supplier.phone}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-gray-600">
                    <span className="flex items-center gap-2">
                      <Mail size={15} />
                      {supplier.email}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-gray-600">
                    <span className="flex items-center gap-2">
                      <MapPin size={15} />
                      {supplier.location}
                    </span>
                  </td>

                  {userRole === "owner" && (
                    <td className="px-6 py-5">
                      <button
                        type="button"
                        aria-label={`More actions for ${supplier.name}`}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                        title="Supplier actions will be added with the supplier form"
                      >
                        <MoreVertical size={19} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {filteredSuppliers.length === 0 && (
                <tr>
                  <td
                    colSpan={userRole === "owner" ? 6 : 5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No suppliers found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Sample supplier information for frontend development.
      </p>

    </div>
  );
}

export default Suppliers;
