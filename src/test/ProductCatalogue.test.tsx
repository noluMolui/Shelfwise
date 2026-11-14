import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductCatalogue from "../pages/ProductCatalogue";

describe("Product Catalogue", () => {
  it("shows product details and low-stock status", () => {
    render(<ProductCatalogue />);
    const table = within(screen.getByRole("table"));

    expect(screen.getByRole("heading", { name: "Products" })).toBeTruthy();
    expect(table.getByText("A4 Exercise Book")).toBeTruthy();
    expect(table.getByText("R25.00")).toBeTruthy();
    expect(table.getAllByText("Low stock")).toHaveLength(2);
  });

  it("filters by product name or SKU and by category", () => {
    render(<ProductCatalogue />);
    const table = within(screen.getByRole("table"));

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "st002" },
    });
    expect(table.getByText("Blue Ballpoint Pen")).toBeTruthy();
    expect(table.queryByText("A4 Exercise Book")).toBeNull();

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Beverages" },
    });
    expect(table.getByText("2L Bottled Water")).toBeTruthy();
    expect(table.queryByText("USB-C Cable")).toBeNull();
  });

  it("shows the designed empty state when there are no products", () => {
    render(<ProductCatalogue products={[]} />);

    expect(screen.getByRole("heading", { name: "No products yet." })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Add product" }),
    ).toBeTruthy();
  });

  it("hides product-management controls for staff", () => {
    render(<ProductCatalogue userRole="staff_member" />);

    expect(screen.queryByRole("button", { name: "Add product" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Edit A4 Exercise Book" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Archive A4 Exercise Book" }),
    ).toBeNull();
  });

  it("shows loading and offline states", () => {
    const { rerender } = render(<ProductCatalogue displayState="loading" />);
    expect(screen.getByRole("status", { name: "Loading products" })).toBeTruthy();

    rerender(<ProductCatalogue displayState="offline" />);
    expect(
      screen.getByText(
        "You’re offline. Showing previously loaded products where available.",
      ),
    ).toBeTruthy();
    expect(screen.getByRole("table")).toBeTruthy();
  });

  it("shows a retry action when product loading fails", () => {
    const onRetry = vi.fn();
    render(<ProductCatalogue displayState="error" onRetry={onRetry} />);

    expect(
      screen.getByText("We couldn’t load your products. Please try again."),
    ).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("shows a dismissible save toast", () => {
    render(<ProductCatalogue displayState="success" />);

    expect(screen.getByText("Product saved.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    expect(screen.queryByText("Product saved.")).toBeNull();
  });
});
