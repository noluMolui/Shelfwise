import { useState } from "react";
import {
  AlertTriangle,
  Archive,
  Check,
  CircleAlert,
  PackageOpen,
  Plus,
  RefreshCw,
  Search,
  SquarePen,
  X,
} from "lucide-react";
import "./ProductCatalogue.css";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  lowStockThreshold: number | null;
};

type ProductCatalogueProps = {
  products?: Product[];
  userRole?: "business_owner" | "staff_member";
  displayState?: "normal" | "loading" | "error" | "offline" | "success";
  onRetry?: () => void;
};

const sampleProducts: Product[] = [
  {
    id: "st001",
    name: "A4 Exercise Book",
    sku: "ST001",
    category: "Stationery",
    quantity: 40,
    unitPrice: 25,
    lowStockThreshold: 10,
  },
  {
    id: "st002",
    name: "Blue Ballpoint Pen",
    sku: "ST002",
    category: "Stationery",
    quantity: 6,
    unitPrice: 8.5,
    lowStockThreshold: 10,
  },
  {
    id: "dr001",
    name: "2L Bottled Water",
    sku: "DR001",
    category: "Beverages",
    quantity: 24,
    unitPrice: 18,
    lowStockThreshold: 8,
  },
  {
    id: "el001",
    name: "USB-C Cable",
    sku: "EL001",
    category: "Electronics",
    quantity: 3,
    unitPrice: 79,
    lowStockThreshold: 5,
  },
];

function ProductCatalogue({
  products = sampleProducts,
  userRole = "business_owner",
  displayState = "normal",
  onRetry,
}: ProductCatalogueProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [successToastVisible, setSuccessToastVisible] = useState(true);
  const isOwner = userRole === "business_owner";
  const categories = [...new Set(products.map((product) => product.category))];

  const visibleProducts = products.filter((product) => {
    const search = searchTerm.trim().toLocaleLowerCase();
    const matchesSearch =
      product.name.toLocaleLowerCase().includes(search) ||
      product.sku.toLocaleLowerCase().includes(search);
    const matchesCategory =
      selectedCategory === "All categories" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="product-catalogue">
      <div className="catalogue-heading">
        <div>
          <h1>Products</h1>
          <p>
            {products.length} {products.length === 1 ? "item" : "items"} in
            inventory
          </p>
        </div>
        {isOwner && products.length > 0 && (
          <button type="button" className="catalogue-primary-button">
            <Plus size={17} aria-hidden="true" />
            <span>Add product</span>
          </button>
        )}
      </div>

      <section className="catalogue-panel" aria-label="Product catalogue">
        {displayState === "success" && successToastVisible && (
          <div className="catalogue-success-toast" role="status">
            <span className="catalogue-success-icon">
              <Check size={14} aria-hidden="true" />
            </span>
            <span>
              <strong>Product saved.</strong>
              <small>Your changes have been saved to the catalogue.</small>
            </span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setSuccessToastVisible(false)}
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        )}

        <div className="catalogue-filters">
          <label className="catalogue-search">
            <Search size={17} aria-hidden="true" />
            <span className="visually-hidden">Search by name or SKU</span>
            <input
              type="search"
              placeholder="Search by name or SKU"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </label>

          <label className="catalogue-category">
            <span className="visually-hidden">Filter by category</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              <option>All categories</option>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>

        {displayState === "offline" && (
          <div className="catalogue-offline-banner" role="status">
            You’re offline. Showing previously loaded products where available.
          </div>
        )}

        {displayState === "loading" ? (
          <div className="catalogue-skeleton" role="status" aria-label="Loading products">
            <div className="catalogue-skeleton-header" />
            {Array.from({ length: 4 }, (_, index) => (
              <div className="catalogue-skeleton-row" key={index}>
                <span />
                <span />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : displayState === "error" ? (
          <div className="catalogue-error-state" role="alert">
            <div className="catalogue-error-icon">
              <CircleAlert size={20} aria-hidden="true" />
            </div>
            <h2>Unable to load products</h2>
            <p>We couldn’t load your products. Please try again.</p>
            <button
              type="button"
              className="catalogue-primary-button"
              onClick={onRetry}
            >
              <RefreshCw size={14} aria-hidden="true" />
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="catalogue-empty-state">
            <div className="catalogue-empty-icon">
              <PackageOpen size={23} aria-hidden="true" />
            </div>
            <h2>No products yet.</h2>
            <p>Add your first product to get started.</p>
            {isOwner && (
              <button type="button" className="catalogue-primary-button">
                <Plus size={16} aria-hidden="true" />
                Add product
              </button>
            )}
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className="catalogue-no-results">
            No products match your search.
          </div>
        ) : (
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
                    {isOwner && <th scope="col">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {visibleProducts.map((product) => {
                    const isLowStock =
                      product.lowStockThreshold !== null &&
                      product.quantity <= product.lowStockThreshold;

                    return (
                      <tr key={product.id}>
                        <td className="catalogue-product-name">
                          {product.name}
                        </td>
                        <td className="catalogue-sku">{product.sku}</td>
                        <td>
                          <span className="catalogue-category-tag">
                            {product.category}
                          </span>
                        </td>
                        <td
                          className={
                            isLowStock
                              ? "catalogue-quantity is-low"
                              : "catalogue-quantity"
                          }
                        >
                          {product.quantity}
                        </td>
                        <td className="catalogue-price">
                          R{product.unitPrice.toFixed(2)}
                        </td>
                        <td>
                          {isLowStock ? (
                            <span className="catalogue-low-stock">
                              <AlertTriangle size={13} aria-hidden="true" />
                              Low stock
                            </span>
                          ) : (
                            <span className="catalogue-stock-ok">—</span>
                          )}
                        </td>
                        {isOwner && (
                          <td>
                            <div className="catalogue-actions">
                              <button
                                type="button"
                                className="catalogue-action-button"
                                aria-label={`Edit ${product.name}`}
                              >
                                <SquarePen size={15} aria-hidden="true" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="catalogue-archive-button"
                                aria-label={`Archive ${product.name}`}
                              >
                                <Archive size={14} aria-hidden="true" />
                                <span>Archive</span>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="catalogue-product-cards">
              {visibleProducts.map((product) => {
                const isLowStock =
                  product.lowStockThreshold !== null &&
                  product.quantity <= product.lowStockThreshold;

                return (
                  <article className="catalogue-product-card" key={product.id}>
                    <div className="catalogue-card-heading">
                      <h2>{product.name}</h2>
                      <span className="catalogue-category-tag">
                        {product.category}
                      </span>
                    </div>
                    <p className="catalogue-card-sku">SKU: {product.sku}</p>
                    <div className="catalogue-card-details">
                      <span>
                        Quantity: <strong>{product.quantity}</strong>
                      </span>
                      <span>
                        Price: <strong>R{product.unitPrice.toFixed(2)}</strong>
                      </span>
                    </div>
                    {isLowStock && (
                      <span className="catalogue-low-stock">
                        <AlertTriangle size={13} aria-hidden="true" />
                        Low stock
                      </span>
                    )}
                    {isOwner && (
                      <div className="catalogue-card-actions">
                        <button
                          type="button"
                          className="catalogue-action-button"
                          aria-label={`Edit ${product.name}`}
                        >
                          <SquarePen size={15} aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="catalogue-archive-button"
                          aria-label={`Archive ${product.name}`}
                        >
                          <Archive size={14} aria-hidden="true" />
                          Archive
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default ProductCatalogue;
