import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/common/AppHeader';
import { Button } from '../components/common/Button';
import { MainNavigation } from '../components/common/MainNavigation';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { SelectField } from '../components/common/SelectField';
import { TextField } from '../components/common/TextField';
import { useCurrentProfile } from '../app/useCurrentProfile';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { listProducts } from '../lib/api/products';
import { messages } from '../lib/messages';
import { productCategories } from '../lib/database.types';
import { formatZar } from '../utils/format';

export function ProductCataloguePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [toast, setToast] = useState<string | null>(() => {
    const state = location.state as { message?: string } | null;
    return state?.message ?? null;
  });
  const online = useOnlineStatus();
  const profile = useCurrentProfile();

  const productsQuery = useInfiniteQuery({
    queryKey: ['products', search, category],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => listProducts({ page: pageParam, search, category }),
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
  });

  const products = productsQuery.data?.pages.flatMap((page) => page.products) ?? [];
  const isOwner = profile.data?.role === 'business_owner';

  function dismissToast() {
    setToast(null);
    if (location.state) navigate(location.pathname, { replace: true, state: null });
  }

  return (
    <>
      <AppHeader title="Products" signedIn />
      <div className="app-layout">
        <MainNavigation />
        <main className="page-shell">
          <div className="page-heading-row">
            <div>
              <p className="eyebrow">INVENTORY</p>
              <h1 className="page-title">Product catalogue</h1>
              <p className="page-subtitle">View and manage the products in your business.</p>
            </div>
            {isOwner ? (
              <Link to="/products/new" className="button button--primary button--link">
                Add product
              </Link>
            ) : null}
          </div>

          {!online ? <OfflineBanner message={messages.offlineRead} /> : null}
          {toast ? (
            <div className="notice notice--success toast" role="status">
              <span>{toast}</span>
              <button type="button" className="toast__dismiss" onClick={dismissToast} aria-label="Dismiss">
                ×
              </button>
            </div>
          ) : null}

          <section className="panel catalogue-panel" aria-label="Products">
            <div className="catalogue-filters">
              <TextField
                label="Search products"
                name="search"
                type="search"
                placeholder="Search by name or SKU"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <SelectField
                label="Category"
                name="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="All categories"
                options={productCategories.map((item) => ({ value: item, label: item }))}
              />
            </div>

            {productsQuery.isLoading ? (
              <div className="catalogue-loading" role="status">
                <span className="loading-spinner" aria-hidden="true" />
                Loading products…
              </div>
            ) : null}
            {productsQuery.isError && !productsQuery.data ? (
              <div className="notice notice--error" role="alert">
                {messages.loadProductsError}
                <button className="text-button" type="button" onClick={() => void productsQuery.refetch()}>
                  Try again
                </button>
              </div>
            ) : null}
            {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state__icon" aria-hidden="true">□</div>
                <h2>No products yet. Add your first product.</h2>
                {isOwner ? (
                  <Link to="/products/new" className="button button--primary button--link">
                    Add product
                  </Link>
                ) : null}
              </div>
            ) : null}
            {products.length > 0 ? (
              <>
                <div className="table-scroll">
                  <table className="product-table">
                    <thead>
                      <tr>
                        <th scope="col">Product</th>
                        <th scope="col">SKU</th>
                        <th scope="col">Category</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Unit price</th>
                        <th scope="col"><span className="visually-hidden">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td data-label="Product">{product.name}</td>
                          <td data-label="SKU">{product.sku}</td>
                          <td data-label="Category">{product.category}</td>
                          <td data-label="Quantity">{product.quantity}</td>
                          <td data-label="Unit price">{formatZar(product.unit_price)}</td>
                          <td className="product-table__action">
                            <Link
                              className="text-button"
                              to={isOwner ? `/products/${product.id}/edit` : `/products/${product.id}`}
                              aria-label={`${isOwner ? 'Edit' : 'View'} ${product.name}`}
                            >
                              {isOwner ? 'Edit' : 'View'}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {productsQuery.hasNextPage ? (
                  <div className="load-more">
                    <Button
                      variant="secondary"
                      loading={productsQuery.isFetchingNextPage}
                      onClick={() => void productsQuery.fetchNextPage()}
                    >
                      Load more
                    </Button>
                  </div>
                ) : null}
              </>
            ) : null}
          </section>
        </main>
      </div>
    </>
  );
}
