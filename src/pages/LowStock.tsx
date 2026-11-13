
import { useState } from "react";
import {
  AlertTriangle,
  Search,
  Package,
  ArrowDown,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  threshold: number;
};

const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Premium Coffee Beans",
    sku: "COF-001",
    category: "Beverages",
    quantity: 3,
    threshold: 10,
  },
  {
    id: 2,
    name: "White Sugar 2kg",
    sku: "SUG-002",
    category: "Groceries",
    quantity: 5,
    threshold: 15,
  },
  {
    id: 3,
    name: "Plastic Packaging",
    sku: "PKG-003",
    category: "Packaging",
    quantity: 2,
    threshold: 8,
  },
  {
    id: 4,
    name: "Sunflower Oil 1L",
    sku: "OIL-004",
    category: "Groceries",
    quantity: 4,
    threshold: 12,
  },
  {
    id: 5,
    name: "Paper Shopping Bags",
    sku: "BAG-005",
    category: "Packaging",
    quantity: 8,
    threshold: 10,
  },
];

function LowStock() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = sampleProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">

      {/* Page Heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">
          Low Stock
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Monitor products that need to be restocked.
        </p>
      </div>

      {/* Alert Summary */}
      <div className="mb-8 rounded-xl border border-orange-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="rounded-lg bg-orange-50 p-3">
            <AlertTriangle className="text-warning" size={27} />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Products below stock threshold
            </p>
            <h2 className="text-3xl font-bold text-primary">
              {sampleProducts.length}
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
            placeholder="Search products or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="font-semibold text-primary">
            Products Requiring Attention
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Products with quantities below their minimum threshold.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">

            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Current Stock</th>
                <th className="px-6 py-4 font-medium">Threshold</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">

                  <td className="px-6 py-5 font-medium text-primary">
                    <span className="flex items-center gap-3">
                      <Package size={19} className="text-accent" />
                      {product.name}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-gray-500">
                    {product.sku}
                  </td>

                  <td className="px-6 py-5 text-gray-600">
                    {product.category}
                  </td>

                  <td className="px-6 py-5">
                    <span className="font-semibold text-warning">
                      {product.quantity} units
                    </span>
                  </td>

                  <td className="px-6 py-5 text-gray-600">
                    {product.threshold} units
                  </td>

                  <td className="px-6 py-5">
                    <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-gray-800">
                      <ArrowDown size={14} className="text-warning" />
                      Low Stock
                    </span>
                  </td>

                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No matching low-stock products found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Sample inventory information for frontend development.
      </p>

    </div>
  );
}

export default LowStock;
