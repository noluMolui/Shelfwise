import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AlertCircle, ArrowDown, ArrowUp, Package, WifiOff } from "lucide-react";
import { Link } from "react-router-dom";
import "./RecordMovement.css";

const sampleProducts = [
  { sku: "ST001", name: "A4 Exercise Book", quantity: 40 },
  { sku: "ST002", name: "Blue Ballpoint Pen", quantity: 6 },
  { sku: "DR001", name: "2L Bottled Water", quantity: 24 },
  { sku: "EL001", name: "USB-C Cable", quantity: 3 },
];

function RecordMovement() {
  const [productSku, setProductSku] = useState("");
  const [movementType, setMovementType] = useState<"incoming" | "outgoing">("incoming");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [productError, setProductError] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [message, setMessage] = useState("");
  const [online, setOnline] = useState(() => navigator.onLine);
  const product = sampleProducts.find((item) => item.sku === productSku);

  useEffect(() => {
    const updateConnection = () => setOnline(navigator.onLine);
    window.addEventListener("online", updateConnection);
    window.addEventListener("offline", updateConnection);
    return () => {
      window.removeEventListener("online", updateConnection);
      window.removeEventListener("offline", updateConnection);
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const nextProductError = product ? "" : "This field is required.";
    let nextQuantityError = "";
    const amount = Number(quantity);
    if (!/^\d+$/.test(quantity) || !Number.isSafeInteger(amount) || amount <= 0) {
      nextQuantityError = "Enter a quantity greater than zero.";
    } else if (product && movementType === "outgoing" && amount > product.quantity) {
      nextQuantityError = "There is not enough stock for this movement.";
    }
    setProductError(nextProductError);
    setQuantityError(nextQuantityError);

    if (nextProductError || nextQuantityError) return;
    if (!online) {
      setMessage("You’re offline. Your changes have not been saved.");
      return;
    }
    setMessage("This movement was not saved. Backend integration is not available yet.");
  }

  return (
    <div className="movement-page">
      <header className="movement-header">
        <Link className="movement-brand" to="/products">ShelfWise<span>.</span></Link>
        <span className="movement-header-title">Record movement</span>
      </header>

      <main className="movement-main">
        <section className="movement-card">
          <div className="movement-heading">
            <h1>Record Stock Movement</h1>
            <p>Audit log entry for inventory dispatch, receipt, or physical stock recount.</p>
          </div>

          <p className="movement-preview">
            Preview using sample products. Stock movements are not saved yet.
          </p>

          {!online && (
            <div className="movement-notice" role="status">
              <WifiOff size={17} aria-hidden="true" />
              <span>You’re offline. Your changes have not been saved.</span>
            </div>
          )}

          {message && (
            <div className="movement-notice" role="alert">
              <AlertCircle size={17} aria-hidden="true" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="movement-field">
              <label htmlFor="movement-product">Product <span>*</span></label>
              <select
                id="movement-product"
                value={productSku}
                aria-invalid={Boolean(productError)}
                aria-describedby={productError ? "movement-product-error" : "movement-product-hint"}
                onChange={(event) => {
                  setProductSku(event.target.value);
                  setProductError("");
                  setQuantityError("");
                  setMessage("");
                }}
              >
                <option value="">Select a product</option>
                {sampleProducts.map((item) => (
                  <option value={item.sku} key={item.sku}>
                    {item.name} ({item.sku})
                  </option>
                ))}
              </select>
              {productError ? (
                <p id="movement-product-error" className="movement-error" role="alert">{productError}</p>
              ) : (
                <p id="movement-product-hint" className="movement-hint">Choose a product to adjust its inventory.</p>
              )}
            </div>

            <div className="movement-field">
              <span className="movement-label">Current stock</span>
              <div className="movement-stock">
                <span><Package size={16} aria-hidden="true" /> Available inventory</span>
                <strong>{product ? product.quantity : "—"}</strong>
              </div>
              <p className="movement-hint">Read-only quantity for the selected product.</p>
            </div>

            <fieldset className="movement-field">
              <legend>Movement type <span>*</span></legend>
              <div className="movement-type-options">
                {(["incoming", "outgoing"] as const).map((type) => (
                  <label className="movement-type-option" key={type}>
                    <input
                      type="radio"
                      name="movementType"
                      value={type}
                      checked={movementType === type}
                      onChange={() => {
                        setMovementType(type);
                        setQuantityError("");
                        setMessage("");
                      }}
                    />
                    {type === "incoming" ? <ArrowDown size={15} aria-hidden="true" /> : <ArrowUp size={15} aria-hidden="true" />}
                    {type === "incoming" ? "Incoming" : "Outgoing"}
                  </label>
                ))}
              </div>
              <p className="movement-hint">Choose whether stock is being added or removed.</p>
            </fieldset>

            <div className="movement-field">
              <label htmlFor="movement-quantity">Quantity <span>*</span></label>
              <input
                id="movement-quantity"
                type="text"
                inputMode="numeric"
                value={quantity}
                aria-invalid={Boolean(quantityError)}
                aria-describedby={quantityError ? "movement-quantity-error" : "movement-quantity-hint"}
                onChange={(event) => {
                  setQuantity(event.target.value);
                  setQuantityError("");
                  setMessage("");
                }}
              />
              {quantityError ? (
                <p id="movement-quantity-error" className="movement-error" role="alert">{quantityError}</p>
              ) : (
                <p id="movement-quantity-hint" className="movement-hint">Required whole number greater than zero.</p>
              )}
            </div>

            <div className="movement-field">
              <label htmlFor="movement-note">Note (optional)</label>
              <textarea
                id="movement-note"
                value={note}
                maxLength={500}
                placeholder="Optional audit memo or reference..."
                onChange={(event) => setNote(event.target.value)}
              />
              <p className="movement-hint">Optional context for your audit records.</p>
            </div>

            <div className="movement-actions">
              <button type="submit" className="movement-save">Save</button>
              <Link to="/products" className="movement-cancel">Cancel</Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default RecordMovement;
