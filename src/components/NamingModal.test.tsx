import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NamingModal } from "./NamingModal";

describe("NamingModal", () => {
  it("T-4.1: modal renders when passed a submitName prop", () => {
    render(<NamingModal submitName={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /name your pet/i })).toBeInTheDocument();
  });

  it("T-4.2: submit button is disabled when input is empty", () => {
    render(<NamingModal submitName={vi.fn()} />);
    expect(screen.getByRole("button", { name: /start/i })).toBeDisabled();
  });

  it("T-4.3: submit button is disabled when input contains only whitespace", async () => {
    const user = userEvent.setup();
    render(<NamingModal submitName={vi.fn()} />);
    await user.type(screen.getByLabelText(/name your fox/i), "   ");
    expect(screen.getByRole("button", { name: /start/i })).toBeDisabled();
  });

  it("T-4.4: submit button is enabled after typing a non-empty name", async () => {
    const user = userEvent.setup();
    render(<NamingModal submitName={vi.fn()} />);
    await user.type(screen.getByLabelText(/name your fox/i), "Zuki");
    expect(screen.getByRole("button", { name: /start/i })).not.toBeDisabled();
  });

  it("T-4.5: submitting a valid name calls submitName with the trimmed value", async () => {
    const user = userEvent.setup();
    const submitName = vi.fn();
    render(<NamingModal submitName={submitName} />);
    await user.type(screen.getByLabelText(/name your fox/i), "  Zuki  ");
    await user.click(screen.getByRole("button", { name: /start/i }));
    expect(submitName).toHaveBeenCalledWith("Zuki");
  });
});
