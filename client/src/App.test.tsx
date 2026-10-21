import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("Client Baseline Rendering Test", () => {
  it("renders WatchBox brand header and Phase 1 completion tag", () => {
    render(<App />);
    expect(screen.getByRole("heading", { name: "WatchBox" })).toBeInTheDocument();
    expect(screen.getByText(/Phase 1 Scaffolding Initialized/i)).toBeInTheDocument();
  });
});
