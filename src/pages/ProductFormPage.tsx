import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { AppHeader } from '../components/common/AppHeader';
import { Button } from '../components/common/Button';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { SelectField } from '../components/common/SelectField';
import { TextField } from '../components/common/TextField';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { getProduct, saveProduct } from '../lib/api/products';
import { ProductAccessError } from '../lib/api/errors';
import { listSupplierOptions } from '../lib/api/suppliers';
import { messages } from '../lib/messages';
import { productCategories, type ProductCategory, type ProductInput } from '../lib/database.types';
import { validateProduct, type ProductFormErrors, type ProductFormValues } from '../lib/rules/product';

type Props = { mode: 'add' | 'edit' | 'view'; preview?: boolean };

const emptyValues: ProductFormValues = {
  name: '',
  sku: '',
  category: '',
  description: '',
  unitPrice: '',
  lowStockThreshold: '',
  supplierId: '',
};

const previewValues: ProductFormValues = {
  name: 'A4 Exercise Book',
  sku: 'ST001',
  category: 'Stationery',
  description: '80-page lined exercise book.',
  unitPrice: '15.00',
  lowStockThreshold: '10',
  supplierId: 'preview-supplier',
};

const previewSuppliers = [{ id: 'preview-supplier', name: 'Mzansi Stationers' }];

function toFormValues(product: Awaited<ReturnType<typeof getProduct>>): ProductFormValues {
  return {
    name: product.name,
    sku: product.sku,
    category: product.category,
    description: product.description ?? '',
    unitPrice: product.unit_price.toFixed(2),
    lowStockThreshold: product.low_stock_threshold?.toString() ?? '',
    supplierId: product.supplier_id ?? '',
  };
}

export function ProductFormPage({ mode, preview = false }: Props) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const online = useOnlineStatus();
  const [values, setValues] = useState<ProductFormValues>(preview ? previewValues : emptyValues);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const isView = mode === 'view';
  const isAdd = mode === 'add';
  const title = isAdd ? 'Add product' : isView ? 'View product' : 'Edit product';

  const productQuery = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id!),
    enabled: !isAdd && Boolean(id),
  });
  const suppliersQuery = useQuery({
    queryKey: ['suppliers', 'options'],
    queryFn: listSupplierOptions,
    staleTime: 60_000,
    enabled: !preview,
  });
  const saveMutation = useMutation({
    mutationFn: (input: ProductInput) => saveProduct(input, isAdd ? undefined : id),
  });

  useEffect(() => {
    if (productQuery.data) setValues(toFormValues(productQuery.data));
  }, [productQuery.data]);

  useEffect(() => {
    if (productQuery.error instanceof ProductAccessError) {
      navigate('/products', {
        replace: true,
        state: { message: messages.notAllowed },
      });
    }
  }, [productQuery.error, navigate]);

  function updateField<K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!online) {
      setFormError(messages.offline);
      return;
    }

    const nextErrors = validateProduct(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (preview) {
      setFormError('This is a visual preview. Changes will not be saved.');
      return;
    }

    const input: ProductInput = {
      name: values.name.trim(),
      sku: values.sku.trim(),
      category: values.category as ProductCategory,
      description: values.description.trim() || null,
      unit_price: Number(values.unitPrice),
      low_stock_threshold:
        values.lowStockThreshold.trim() === '' ? null : Number(values.lowStockThreshold),
      supplier_id: values.supplierId || null,
    };

    try {
      await saveMutation.mutateAsync(input);
      await queryClient.invalidateQueries({ queryKey: ['products'] });
      await queryClient.invalidateQueries({ queryKey: ['product', id] });
      navigate('/products', { replace: true, state: { message: messages.saved } });
    } catch (error) {
      setFormError(
        !navigator.onLine
          ? messages.offline
          : error instanceof Error
            ? error.message
            : messages.saveProductError,
      );
    }
  }

  function handleCancel() {
    if (preview) {
      setValues(previewValues);
      setErrors({});
      setFormError(null);
      return;
    }
    navigate('/products');
  }

  const loadingProduct = !isAdd && productQuery.isLoading;
  const productLoadFailed =
    !isAdd &&
    productQuery.isError &&
    !productQuery.data &&
    !(productQuery.error instanceof ProductAccessError);
  const isBusy = saveMutation.isPending || loadingProduct;
  const disabled = isView || loadingProduct || productLoadFailed || saveMutation.isPending;

  return (
    <>
      <AppHeader title={title} signedIn={!preview} />
      <main className="form-page">
        <section className="panel product-form-panel" aria-labelledby="product-form-title">
          <div className="form-page__heading">
            <p className="eyebrow">PRODUCT MANAGEMENT</p>
            <h1 className="page-title" id="product-form-title">{title}</h1>
            <p className="page-subtitle">
              {isView
                ? 'Product details are read-only.'
                : isAdd
                  ? 'Add the details for the product you want to track.'
                  : 'Update the product details for your business.'}
            </p>
            <p className="product-form-panel__note">
              Prices are shown in South African Rand (ZAR).
            </p>
          </div>

          {preview ? (
            <div className="notice notice--warning form-alert" role="note">
              Preview only. Product changes will not be saved.
            </div>
          ) : null}
          {!online ? (
            <OfflineBanner message={isView ? messages.offlineRead : messages.offline} />
          ) : null}
          {formError ? (
            <div className="notice notice--error form-alert" role="alert">
              <span className="notice__icon" aria-hidden="true">!</span>
              {formError}
            </div>
          ) : null}
          {productLoadFailed ? (
            <div className="notice notice--error form-alert" role="alert">
              {messages.loadProductError}
              <button type="button" className="text-button" onClick={() => void productQuery.refetch()}>
                Try again
              </button>
            </div>
          ) : null}
          {suppliersQuery.isError && !suppliersQuery.data && !isView ? (
            <div className="notice notice--error form-alert" role="alert">
              We couldn’t load suppliers. Please try again.
              <button type="button" className="text-button" onClick={() => void suppliersQuery.refetch()}>
                Try again
              </button>
            </div>
          ) : null}

          {loadingProduct ? (
            <div className="catalogue-loading" role="status">
              <span className="loading-spinner" aria-hidden="true" />
              Loading product…
            </div>
          ) : null}
          <form className="product-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
            <TextField
              label="Product name"
              name="name"
              placeholder="e.g. A4 Exercise Book"
              value={values.name}
              onChange={(event) => updateField('name', event.target.value)}
              maxLength={120}
              required
              disabled={disabled}
              error={errors.name}
              autoComplete="off"
            />
            <TextField
              label="SKU"
              name="sku"
              placeholder="e.g. ST001"
              value={values.sku}
              onChange={(event) => updateField('sku', event.target.value)}
              maxLength={60}
              required
              disabled={disabled}
              error={errors.sku}
              hint="Must be unique within your business."
              autoComplete="off"
            />
            <SelectField
              label="Category"
              name="category"
              value={values.category}
              onChange={(event) => updateField('category', event.target.value)}
              required
              disabled={disabled}
              error={errors.category}
              placeholder="Select a category"
              options={productCategories.map((category) => ({ value: category, label: category }))}
            />
            <div className="field">
              <label className="field__label" htmlFor="description">Description <span className="field__optional">(optional)</span></label>
              <textarea
                id="description"
                name="description"
                className={`field__control field__textarea${errors.description ? ' field__control--error' : ''}`}
                placeholder="Add product details, brand, dimensions, or manufacturer information."
                value={values.description}
                onChange={(event) => updateField('description', event.target.value)}
                maxLength={1000}
                disabled={disabled}
                aria-invalid={Boolean(errors.description)}
                aria-describedby={errors.description ? 'description-error' : undefined}
                rows={3}
              />
              {errors.description ? <span className="field__error" id="description-error">{errors.description}</span> : null}
            </div>
            <TextField
              label="Unit price (ZAR)"
              name="unitPrice"
              type="number"
              min="0"
              max="9999999999.99"
              step="0.01"
              placeholder="0.00"
              value={values.unitPrice}
              onChange={(event) => updateField('unitPrice', event.target.value)}
              required
              disabled={disabled}
              error={errors.unitPrice}
              hint="Selling price per unit."
            />
            <TextField
              label="Low-stock threshold"
              name="lowStockThreshold"
              type="number"
              min="0"
              max="2147483647"
              step="1"
              placeholder="e.g. 10"
              value={values.lowStockThreshold}
              onChange={(event) => updateField('lowStockThreshold', event.target.value)}
              disabled={disabled}
              error={errors.lowStockThreshold}
              hint="Optional. Get an alert when quantity is at or below this number."
            />
            <SelectField
              label="Supplier"
              name="supplierId"
              value={values.supplierId}
              onChange={(event) => updateField('supplierId', event.target.value)}
              disabled={
                disabled ||
                (preview ? false : suppliersQuery.isLoading) ||
                (suppliersQuery.isError && !suppliersQuery.data)
              }
              placeholder={suppliersQuery.isLoading ? 'Loading suppliers…' : 'Select supplier'}
              options={(preview ? previewSuppliers : suppliersQuery.data ?? []).map((supplier) => ({
                value: supplier.id,
                label: supplier.name,
              })).concat(
                productQuery.data?.supplier && !suppliersQuery.data?.some(
                  (supplier) => supplier.id === productQuery.data?.supplier?.id,
                )
                  ? [{
                      value: productQuery.data.supplier.id,
                      label: productQuery.data.supplier.name,
                    }]
                  : [],
              )}
            />
            <div className="form-actions">
              {isView ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/products')}
                  disabled={saveMutation.isPending}
                >
                  Back to products
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    loading={saveMutation.isPending}
                    disabled={loadingProduct || productLoadFailed}
                  >
                    Save
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              )}
              {isBusy && !saveMutation.isPending ? (
                <span className="field__hint">Loading product details…</span>
              ) : null}
            </div>
          </form>
          <p className="form-note">Stock quantity is updated by recording stock movements.</p>
        </section>
      </main>
    </>
  );
}
