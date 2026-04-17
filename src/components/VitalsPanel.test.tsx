import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VitalsPanel } from "./VitalsPanel";

describe("VitalsPanel", () => {
  it("T-3.1: renders three elements with labels Hunger, Happiness, Energy", () => {
    render(<VitalsPanel hunger={70} happiness={70} energy={70} />);
    expect(screen.getByText("Hunger")).toBeInTheDocument();
    expect(screen.getByText("Happiness")).toBeInTheDocument();
    expect(screen.getByText("Energy")).toBeInTheDocument();
  });

  it("T-3.2: each progress bar has role=progressbar with correct aria-valuenow", () => {
    render(<VitalsPanel hunger={80} happiness={60} energy={40} />);
    const bars = screen.getAllByRole("progressbar");
    expect(bars).toHaveLength(3);
    const values = bars.map((b) => Number(b.getAttribute("aria-valuenow")));
    expect(values).toContain(80);
    expect(values).toContain(60);
    expect(values).toContain(40);
  });

  it("T-3.3: a stat value of 75 renders a green bar", () => {
    render(<VitalsPanel hunger={75} happiness={70} energy={70} />);
    const hungerBar = screen.getByRole("progressbar", { name: "Hunger" });
    expect(hungerBar).toHaveAttribute("data-color", "green");
  });

  it("T-3.4: a stat value of 35 renders a yellow bar", () => {
    render(<VitalsPanel hunger={35} happiness={70} energy={70} />);
    const hungerBar = screen.getByRole("progressbar", { name: "Hunger" });
    expect(hungerBar).toHaveAttribute("data-color", "yellow");
  });

  it("T-3.5: a stat value of 20 renders a red bar", () => {
    render(<VitalsPanel hunger={20} happiness={70} energy={70} />);
    const hungerBar = screen.getByRole("progressbar", { name: "Hunger" });
    expect(hungerBar).toHaveAttribute("data-color", "red");
  });
});
