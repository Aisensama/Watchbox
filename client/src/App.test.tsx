import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("Client Application Integration", () => {
  it("renders WatchBox brand logo and main navigation links", async () => {
    render(<App />);

    // Brand logo
    const brandElements = screen.getAllByText(/Watch/i);
    expect(brandElements.length).toBeGreaterThan(0);

    // Navigation links
    expect(screen.getByRole("link", { name: /^Home$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Explore$/i })).toBeInTheDocument();
  });
});
