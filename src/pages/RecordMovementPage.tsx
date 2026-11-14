import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/common/AppHeader';
import { Button } from '../components/common/Button';
import { OfflineBanner } from '../components/common/OfflineBanner';
import { SelectField } from '../components/common/SelectField';
import { TextField } from '../components/common/TextField';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  listActiveProducts,
  recordStockMovement,
} from '../lib/api/movements';
import type { MovementType } from '../lib/database.types';
import { messages } from '../lib/messages';
import { validateMovementQuantity } from '../lib/rules/movement';

export function RecordMovementPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const online = useOnlineStatus();
  const productsQuery = useQuery({
    queryKey: ['activeProductsForMovement'],
    queryFn: listActiveProducts,
    enabled: online,
  });
  const [productId, setProductId] = useState('');
  const [movementType, setMovementType] = useState<MovementType>('incoming');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [quantityError, setQuantityError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const products = productsQuery.data ?? [];
  const selectedProduct = products.find((product) => product.id === productId);

  useEffect(() => {
    if (!productId && products.length > 0) setProductId(products[0].id);
  }, [productId, products]);

  const saveMutation = useMutation({
    mutationFn: recordStockMovement,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stockMovements'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['activeProductsForMovement'] }),
      ]);
      navigate('/stock', { replace: true, state: { message: messages.movementSaved } });
    },
    onError: (error: Error) => setSubmitError(error.message || messages.recordMovementError),
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    const invalidQuantity = validateMovementQuantity(quantity);
    setQuantityError(invalidQuantity ?? undefined);

    if (!online) {
      setSubmitError(messages.offline);
      return;
    }
    if (invalidQuantity || !selectedProduct) return;
    const parsedQuantity = Number(quantity);
    if (movementType === 'outgoing' && parsedQuantity > selectedProduct.quantity) {
      setSubmitError(messages.insufficientStock);
      return;
    }

    saveMutation.mutate({
      productId: selectedProduct.id,
      movementType,
      quantity: parsedQuantity,
      note: note.trim() || null,
    });
  }

  return (
    <>
      <AppHeader title="Record movement" signedIn />
      <main className="page-shell movement-form-shell">
        <div className="movement-form-heading">
          <Link className="breadcrumb-link" to="/stock">Stock Movements</Link>
          <span aria-hidden="true">/</span>
          <span>Record movement</span>
        </div>
        <section className="panel movement-form-card">
          <h1 className="page-title">Record Stock Movement</h1>
          <p className="page-subtitle">
            Add or adjust inventory for incoming stock, dispatch, or physical stock count.
          </p>

          {!online ? <OfflineBanner message={messages.offline} /> : null}
          {submitError ? (
            <div className="notice notice--error movement-form-alert" role="alert">
              {submitError}
            </div>
          ) : null}

          {productsQuery.isLoading ? (
            <div className="movement-loading" role="status">
              <span className="loading-spinner" aria-hidden="true" />
              Loading products…
            </div>
          ) : null}
          {productsQuery.isError ? (
            <div className="notice notice--error movement-form-alert" role="alert">
              {messages.loadMovementProductsError}
              <button
                className="text-button"
                type="button"
                onClick={() => void productsQuery.refetch()}
              >
                Retry
              </button>
            </div>
          ) : null}
          {!productsQuery.isLoading && !productsQuery.isError && products.length === 0 ? (
            <div className="empty-state movement-product-empty">
              <h2>
                {!online && !productsQuery.data
                  ? 'No cached product list is available.'
                  : 'No active products available'}
              </h2>
              <p>
                {!online && !productsQuery.data
                  ? 'Reconnect to load the products available for stock movements.'
                  : 'Add a product before recording a stock movement.'}
              </p>
              {online ? <Link to="/products" className="text-button">Return to products</Link> : null}
            </div>
          ) : null}
          {products.length > 0 ? (
            <form className="movement-form" onSubmit={handleSubmit} noValidate>
              <SelectField
                label="Product"
                name="product"
                required
                value={productId}
                onChange={(event) => {
                  setProductId(event.target.value);
                  setSubmitError(null);
                }}
                options={products.map((product) => ({
                  value: product.id,
                  label: `${product.name} (${product.sku})`,
                }))}
              />

              <div className="movement-current-stock">
                <span>Current stock</span>
                <output aria-label="Current stock">{selectedProduct?.quantity ?? '—'}</output>
              </div>
              <p className="field__hint">Read-only quantity level for the selected product.</p>

              <fieldset className="movement-type-field">
                <legend className="field__label">Movement type <span className="field__required">*</span></legend>
                <div className="movement-type-options">
                  {(['incoming', 'outgoing'] as const).map((type) => (
                    <button
                      key={type}
                      className={`movement-type-option${movementType === type ? ' is-selected' : ''}`}
                      type="button"
                      aria-pressed={movementType === type}
                      onClick={() => {
                        setMovementType(type);
                        setSubmitError(null);
                      }}
                    >
                      <span className="movement-type-option__mark" aria-hidden="true">
                        {movementType === type ? '●' : '○'}
                      </span>
                      {type === 'incoming' ? 'Incoming' : 'Outgoing'}
                    </button>
                  ))}
                </div>
                <span className="field__hint">Specify stock added or removed.</span>
              </fieldset>

              <TextField
                label="Quantity"
                name="quantity"
                type="number"
                min="1"
                step="1"
                required
                value={quantity}
                error={quantityError}
                hint="Required. Enter a whole number greater than zero."
                onChange={(event) => {
                  setQuantity(event.target.value);
                  setQuantityError(undefined);
                  setSubmitError(null);
                }}
              />
              <div className="field">
                <label className="field__label" htmlFor="movement-note">
                  Note <span className="field__optional">(optional)</span>
                </label>
                <textarea
                  id="movement-note"
                  name="note"
                  className="field__control field__textarea"
                  maxLength={500}
                  placeholder="Optional audit note or reference..."
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
                <span className="field__hint">Optional reason for this movement.</span>
              </div>

              <div className="movement-form-actions">
                <Button
                  type="submit"
                  loading={saveMutation.isPending}
                  disabled={!online || productsQuery.isError}
                >
                  Save
                </Button>
                <Link to="/stock" className="button button--secondary button--link">
                  Cancel
                </Link>
              </div>
            </form>
          ) : null}
        </section>
      </main>
    </>
  );
}
