import { useState } from 'react';
import { AlertTriangle, ArrowDown, Package, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppHeader } from '../components/common/AppHeader';
import { MainNavigation } from '../components/common/MainNavigation';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { useLowStockProducts } from '../hooks/useLowStockProducts';
import { messages } from '../lib/messages';
import './ProductCatalogue.css';

function LowStock() {
  const [searchTerm, setSearchTerm] = useState('');
  const query = useLowStockProducts();
  const products = query.data ?? [];
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(normalizedSearch) ||
    product.sku.toLowerCase().includes(normalizedSearch),
  );

  return (
    <>
      <AppHeader title="Low Stock" signedIn />
      <div className="app-layout">
        <MainNavigation />
        <main className="page-shell">
          <div className="min-h-screen bg-background p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-primary">Low Stock</h1>
              <p className="mt-2 text-sm text-gray-500">
                Monitor products that need to be restocked.
              </p>
            </div>

            {!query.online ? (
              <div className="mb-6">
                <OfflineBanner message={messages.offlineLowStockRead} />
              </div>
            ) : null}

            <div className="mb-8 rounded-xl border border-orange-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-orange-50 p-3">
                  <AlertTriangle className="text-warning" size={27} aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Products at or below stock threshold</p>
                  <h2 className="text-3xl font-bold text-primary">
                    {query.isLoading && !query.data ? '—' : products.length}
                  </h2>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="relative block max-w-md">
                <span className="sr-only">Search products or SKU</span>
                <Search
                  className="absolute left-4 top-3.5 text-gray-400"
                  size={19}
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search products or SKU..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-11 pr-4 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </label>
            </div>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm" aria-label="Low-stock products">
              <div className="border-b border-gray-200 px-6 py-5">
                <h2 className="font-semibold text-primary">Products Requiring Attention</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Products with quantities at or below their minimum threshold.
                </p>
              </div>

              {query.isLoading && !query.data ? (
                <div className="p-6" role="status" aria-label="Loading low-stock products">
                  {Array.from({ length: 4 }, (_, index) => (
                    <div
                      className="low-stock-skeleton-row dashboard-skeleton-row mb-4"
                      key={index}
                    />
                  ))}
                </div>
              ) : null}

              {query.isError && !query.data ? (
                <div className="notice notice--error m-6" role="alert">
                  <span>{messages.loadLowStockProductsError}</span>
                  <button
                    type="button"
                    className="text-button ml-2 min-h-[44px]"
                    onClick={() => void query.refetch()}
                  >
                    Retry
                  </button>
                </div>
              ) : null}

              {!query.isLoading && !query.isError && products.length === 0 ? (
                <p className="px-6 py-12 text-center text-gray-500">{messages.emptyLowStock}</p>
              ) : null}

              {!query.isLoading && !query.isError && products.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                      <tr>
                        <th scope="col" className="px-6 py-4 font-medium">Product</th>
                        <th scope="col" className="px-6 py-4 font-medium">SKU</th>
                        <th scope="col" className="px-6 py-4 font-medium">Category</th>
                        <th scope="col" className="px-6 py-4 font-medium">Current Stock</th>
                        <th scope="col" className="px-6 py-4 font-medium">Threshold</th>
                        <th scope="col" className="px-6 py-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-5 font-medium text-primary">
                            <Link
                              to={`/products/${product.id}`}
                              className="inline-flex min-h-[44px] items-center gap-3"
                            >
                              <Package size={19} className="text-accent" aria-hidden="true" />
                              {product.name}
                            </Link>
                          </td>
                          <td className="px-6 py-5 text-gray-500">{product.sku}</td>
                          <td className="px-6 py-5 text-gray-600">{product.category}</td>
                          <td className="px-6 py-5">
                            <span className="font-semibold text-warning">
                              {product.quantity} units
                            </span>
                          </td>
                          <td className="px-6 py-5 text-gray-600">
                            {product.low_stock_threshold} units
                          </td>
                          <td className="px-6 py-5">
                            <span className="catalogue-low-stock">
                              <ArrowDown size={14} aria-hidden="true" />
                              Low stock
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            No matching low-stock products found.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

export default LowStock;
