import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("rend la page d’accueil sans erreur", () => {
    render(<App />);
    expect(screen.getAllByText(/Couture/i).length).toBeGreaterThan(0);
  });
});
