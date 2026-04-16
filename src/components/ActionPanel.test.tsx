import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionPanel } from "./ActionPanel";

describe("ActionPanel", () => {
  it("T-6.1: renders three buttons with visible text containing Feed, Play, and Rest", () => {
    render(<ActionPanel onAction={vi.fn()} />);
    expect(screen.getByText(/Feed/)).toBeInTheDocument();
    expect(screen.getByText(/Play/)).toBeInTheDocument();
    expect(screen.getByText(/Rest/)).toBeInTheDocument();
  });

  it("T-6.2: each button has an aria-label attribute", () => {
    render(<ActionPanel onAction={vi.fn()} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-label");
    });
  });

  it("T-6.3: clicking Feed calls onAction with 'feed'", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<ActionPanel onAction={onAction} />);
    await user.click(screen.getByRole("button", { name: /feed zuki/i }));
    expect(onAction).toHaveBeenCalledWith("feed");
  });

  it("T-6.4: clicking Play calls onAction with 'play'", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<ActionPanel onAction={onAction} />);
    await user.click(screen.getByRole("button", { name: /play with zuki/i }));
    expect(onAction).toHaveBeenCalledWith("play");
  });

  it("T-6.5: clicking Rest calls onAction with 'rest'", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    render(<ActionPanel onAction={onAction} />);
    await user.click(screen.getByRole("button", { name: /rest zuki/i }));
    expect(onAction).toHaveBeenCalledWith("rest");
  });

  it("T-6.6: all three buttons are enabled", () => {
    render(<ActionPanel onAction={vi.fn()} />);
    screen.getAllByRole("button").forEach((btn) => {
      expect(btn).not.toBeDisabled();
    });
  });
});
