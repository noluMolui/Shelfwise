
import { useState } from 'react';
import {
  AlertTriangle,
  Archive,
  PackageOpen,
  RefreshCw,
  Search,
} from 'lucide-react';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { AppHeader } from '../components/common/AppHeader';
import { Button } from '../components/common/Button';
import { MainNavigation } from '../components/common/MainNavigation';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { useCurrentProfile } from '../app/useCurrentProfile';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  archiveProduct,
  listProducts,
} from '../lib/api/products';
import { messages } from '../lib/messages';
import { productCategories } from '../lib/database.types';
import { formatZar } from '../utils/format';

import './ProductCatalogue.css';

export function ProductCataloguePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const [toast, setToast] = useState<string | null>(() => {
    const state = location.state as { message?: string } | null;
    return state?.message ?? null;
  });

  const [archiveError, setArchiveError] = useState<string | null>(null);

  const online = useOnlineStatus();
  const profile = useCurrentProfile();

  const productsQuery = useInfiniteQuery({
    queryKey: ['products', search, category],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      listProducts({ page: pageParam, search, category }),
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + 1 : undefined,
  });

  const archiveMutation = useMutation({
    mutationFn: archiveProduct,

    onSuccess: async () => {
      setToast('Product archived successfully.');
      setArchiveError(null);

      await queryClient.invalidateQueries({
        queryKey: ['products'],
      });
    },

    onError: (error) => {
      setArchiveError(
        error instanceof Error
          ? error.message
          : 'Unable to archive this product. Please try again.',
      );
    },
  });

  const products =
    productsQuery.data?.pages.flatMap((page) => page.products) ?? [];

  const isOwner = profile.data?.role === 'business_owner';
  const hasFilters = Boolean(search.trim() || category);

  function dismissToast() {
    setToast(null);

    if (location.state) {
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }

  function handleArchive(productId: string, productName: string) {
    const confirmed = window.confirm(
      `Are you sure you want to archive "${productName}"? This product will no longer appear in your active catalogue.`,
    );

    if (!confirmed) {
      return;
    }

    setArchiveError(null);
    setToast(null);

    archiveMutation.mutate(productId);
  }

  return (
    <>
      <AppHeader title="Products" signedIn />

      <div className="app-layout">
        <MainNavigation />

        <main className="page-shell">
          <div className="product-catalogue">

            <div className="catalogue-heading">
              <div>
                <h1>Products</h1>

                <p>
                  {products.length}{' '}
                  {products.length === 1 ? 'item' : 'items'} loaded
                </p>
              </div>

              {isOwner ? (
                <Link
                  to="/products/new"
                  className="catalogue-primary-button"
                >
                  <span>Add product</span>
                </Link>
              ) : null}
            </div>

            {!online ? (
              <OfflineBanner message={messages.offlineRead} />
            ) : null}

            {toast ? (
              <div className="catalogue-success-toast" role="status">
                <span>
                  <strong>{toast}</strong>
                </span>

                <button
                  type="button"
                  onClick={dismissToast}
                  aria-label="Dismiss notification"
                >
                  ×
                </button>
              </div>
            ) : null}

            {archiveError ? (
              <div className="catalogue-error-state" role="alert">
                <p>{archiveError}</p>

                <button
                  type="button"
                  onClick={() => setArchiveError(null)}
                >
                  Dismiss
                </button>
              </div>
            ) : null}

            <section
              className="catalogue-panel"
              aria-label="Product catalogue"
            >

              <div className="catalogue-filters">

                <label className="catalogue-search">
                  <Search size={17} aria-hidden="true" />

                  <span className="visually-hidden">
                    Search by name or SKU
                  </span>

                  <input
                    type="search"
                    placeholder="Search by name or SKU"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                  />
                </label>

                <label className="catalogue-category">
                  <span className="visually-hidden">
                    Filter by category
                  </span>

                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value)
                    }
                  >
                    <option value="">All categories</option>

                    {productCategories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

              </div>

              {productsQuery.isLoading ? (
                <div
                  className="catalogue-skeleton"
                  role="status"
                  aria-label="Loading products"
                >
                  <div className="catalogue-skeleton-header" />

                  {Array.from({ length: 4 }, (_, index) => (
                    <div
                      className="catalogue-skeleton-row"
                      key={index}
                    >
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>
                  ))}
                </div>
              ) : null}

              {productsQuery.isError && !productsQuery.data ? (
                <div className="catalogue-error-state" role="alert">
                  <div className="catalogue-error-icon">
                    <RefreshCw size={20} aria-hidden="true" />
                  </div>

                  <h2>Unable to load products</h2>

                  <p>{messages.loadProductsError}</p>

                  <button
                    type="button"
                    className="catalogue-primary-button"
                    onClick={() => void productsQuery.refetch()}
                  >
                    <RefreshCw size={14} aria-hidden="true" />
                    Retry
                  </button>
                </div>
              ) : null}

              {!productsQuery.isLoading &&
              !productsQuery.isError &&
              products.length === 0 &&
              hasFilters ? (
                <div className="catalogue-no-results">
                  No products match your search.
                </div>
              ) : null}

              {!productsQuery.isLoading &&
              !productsQuery.isError &&
              products.length === 0 &&
              !hasFilters ? (
                <div className="catalogue-empty-state">
                  <div className="catalogue-empty-icon">
                    <PackageOpen size={23} aria-hidden="true" />
                  </div>

                  <h2>No products yet.</h2>

                  <p>Add your first product to get started.</p>

                  {isOwner ? (
                    <Link
                      to="/products/new"
                      className="catalogue-primary-button"
                    >
                      Add product
                    </Link>
                  ) : null}
                </div>
              ) : null}

              {products.length > 0 ? (
                <>

                  <div className="catalogue-table-wrap">
                    <table className="catalogue-table">

                      <thead>
                        <tr>
                          <th scope="col">Product name</th>
                          <th scope="col">SKU</th>
                          <th scope="col">Category</th>
                          <th scope="col">Quantity</th>
                          <th scope="col">Unit price</th>
                          <th scope="col">Stock status</th>
                          <th scope="col">Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {products.map((product) => {
                          const isLowStock =
                            product.low_stock_threshold !== null &&
                            product.quantity <=
                              product.low_stock_threshold;

                          return (
                            <tr key={product.id}>

                              <td className="catalogue-product-name">
                                {product.name}
                              </td>

                              <td className="catalogue-sku">
                                {product.sku}
                              </td>

                              <td>
                                <span className="catalogue-category-tag">
                                  {product.category}
                                </span>
                              </td>

                              <td
                                className={
                                  isLowStock
                                    ? 'catalogue-quantity is-low'
                                    : 'catalogue-quantity'
                                }
                              >
                                {product.quantity}
                              </td>

                              <td className="catalogue-price">
                                {formatZar(product.unit_price)}
                              </td>

                              <td>
                                {isLowStock ? (
                                  <span className="catalogue-low-stock">
                                    <AlertTriangle
                                      size={13}
                                      aria-hidden="true"
                                    />
                                    Low stock
                                  </span>
                                ) : (
                                  <span className="catalogue-stock-ok">
                                    —
                                  </span>
                                )}
                              </td>

                              <td>
                                <div className="catalogue-card-actions">

                                  <Link
                                    className="catalogue-action-button"
                                    to={
                                      isOwner
                                        ? `/products/${product.id}/edit`
                                        : `/products/${product.id}`
                                    }
                                    aria-label={`${
                                      isOwner ? 'Edit' : 'View'
                                    } ${product.name}`}
                                  >
                                    {isOwner ? 'Edit' : 'View'}
                                  </Link>

                                  {isOwner ? (
                                    <button
                                      type="button"
                                      className="catalogue-action-button"
                                      aria-label={`Archive ${product.name}`}
                                      disabled={archiveMutation.isPending}
                                      onClick={() =>
                                        handleArchive(
                                          product.id,
                                          product.name,
                                        )
                                      }
                                    >
                                      <Archive
                                        size={14}
                                        aria-hidden="true"
                                      />
                                      Archive
                                    </button>
                                  ) : null}

                                </div>
                              </td>

                            </tr>
                          );
                        })}
                      </tbody>

                    </table>
                  </div>

                  <div className="catalogue-product-cards">

                    {products.map((product) => {
                      const isLowStock =
                        product.low_stock_threshold !== null &&
                        product.quantity <=
                          product.low_stock_threshold;

                      return (
                        <article
                          className="catalogue-product-card"
                          key={product.id}
                        >

                          <div className="catalogue-card-heading">
                            <h2>{product.name}</h2>

                            <span className="catalogue-category-tag">
                              {product.category}
                            </span>
                          </div>

                          <p className="catalogue-card-sku">
                            SKU: {product.sku}
                          </p>

                          <div className="catalogue-card-details">
                            <span>
                              Quantity:{' '}
                              <strong>{product.quantity}</strong>
                            </span>

                            <span>
                              Price:{' '}
                              <strong>
                                {formatZar(product.unit_price)}
                              </strong>
                            </span>
                          </div>

                          {isLowStock ? (
                            <span className="catalogue-low-stock">
                              <AlertTriangle
                                size={13}
                                aria-hidden="true"
                              />
                              Low stock
                            </span>
                          ) : null}

                          <div className="catalogue-card-actions">

                            <Link
                              className="catalogue-action-button"
                              to={
                                isOwner
                                  ? `/products/${product.id}/edit`
                                  : `/products/${product.id}`
                              }
                              aria-label={`${
                                isOwner ? 'Edit' : 'View'
                              } ${product.name}`}
                            >
                              {isOwner ? 'Edit' : 'View'}
                            </Link>

                            {isOwner ? (
                              <button
                                type="button"
                                className="catalogue-action-button"
                                aria-label={`Archive ${product.name}`}
                                disabled={archiveMutation.isPending}
                                onClick={() =>
                                  handleArchive(
                                    product.id,
                                    product.name,
                                  )
                                }
                              >
                                <Archive
                                  size={14}
                                  aria-hidden="true"
                                />
                                Archive
                              </button>
                            ) : null}

                          </div>

                        </article>
                      );
                    })}

                  </div>

                  {productsQuery.hasNextPage ? (
                    <div className="load-more">
                      <Button
                        variant="secondary"
                        loading={productsQuery.isFetchingNextPage}
                        onClick={() =>
                          void productsQuery.fetchNextPage()
                        }
                      >
                        Load more
                      </Button>
                    </div>
                  ) : null}

                </>
              ) : null}

            </section>
          </div>
        </main>
      </div>
    </>
  );
}
