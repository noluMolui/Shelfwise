import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import RecordMovement from "../pages/RecordMovement";

function renderPage() {
  return render(
    <MemoryRouter>
      <RecordMovement />
    </MemoryRouter>,
  );
}

describe("Record stock movement", () => {
  it("shows the selected product's current stock", () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/product/i), {
      target: { value: "ST002" },
    });

    expect(screen.getByText("6")).toBeTruthy();
    expect(screen.getByRole("radio", { name: /incoming/i })).toBeTruthy();
    expect(screen.getByRole("radio", { name: /outgoing/i })).toBeTruthy();
    expect(screen.getByLabelText(/note/i).getAttribute("maxlength")).toBe("500");
  });

  it.each(["", "0", "-1", "1.5"])(
    "rejects invalid quantity %s without losing entered values",
    (quantity) => {
      renderPage();
      fireEvent.change(screen.getByLabelText(/product/i), {
        target: { value: "ST002" },
      });
      fireEvent.change(screen.getByLabelText(/quantity/i), {
        target: { value: quantity },
      });
      fireEvent.change(screen.getByLabelText(/note/i), {
        target: { value: "Stock count" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Save" }));

      expect(screen.getByText("Enter a quantity greater than zero.")).toBeTruthy();
      expect(screen.getByDisplayValue("Stock count")).toBeTruthy();
    },
  );

  it("rejects outgoing stock greater than what is available", () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/product/i), {
      target: { value: "ST002" },
    });
    fireEvent.click(screen.getByRole("radio", { name: /outgoing/i }));
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: "7" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("There is not enough stock for this movement.")).toBeTruthy();
    expect(screen.getByText("6")).toBeTruthy();
  });

  it("does not claim a valid movement was saved without a backend", () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/product/i), {
      target: { value: "ST002" },
    });
    fireEvent.change(screen.getByLabelText(/quantity/i), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText(/not saved.*backend/i)).toBeTruthy();
    expect(screen.getByText("6")).toBeTruthy();
  });
});
