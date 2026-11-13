
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import SignUp from "../pages/SignUp";

describe("Sign Up Page", () => {
  it("displays the registration heading", () => {
    render(<SignUp />);

    expect(
      screen.getByRole("heading", { name: /create your account/i })
    ).toBeTruthy();
  });

  it("displays all required registration fields", () => {
    render(<SignUp />);

    expect(screen.getByLabelText(/full name/i)).toBeTruthy();
    expect(screen.getByLabelText(/business name/i)).toBeTruthy();
    expect(screen.getByLabelText(/email address/i)).toBeTruthy();
    expect(
      screen.getByLabelText("Password", { selector: "input" })
    ).toBeTruthy();
  });
});
