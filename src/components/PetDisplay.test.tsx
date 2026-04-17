import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PetDisplay } from "./PetDisplay";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("PetDisplay — render states (T-8)", () => {
  it("T-8.1: renders without errors for normal status", () => {
    render(<PetDisplay status="normal" name="Zuki" onPetClick={vi.fn()} />);
    expect(screen.getByLabelText(/Pet Zuki/i)).toBeInTheDocument();
  });

  it("T-8.1b: renders without errors for sick and evolved status", () => {
    const { rerender } = render(<PetDisplay status="sick" name="Zuki" onPetClick={vi.fn()} />);
    expect(screen.getByLabelText(/Pet Zuki/i)).toBeInTheDocument();
    rerender(<PetDisplay status="evolved" name="Zuki" onPetClick={vi.fn()} />);
    expect(screen.getByLabelText(/Pet Zuki/i)).toBeInTheDocument();
  });

  it("T-8.2: when status is sick, text 'Sick' is present", () => {
    render(<PetDisplay status="sick" name="Zuki" onPetClick={vi.fn()} />);
    expect(screen.getByText(/sick/i)).toBeInTheDocument();
  });

  it("T-8.3: when status is evolved, text 'Evolved' is present", () => {
    render(<PetDisplay status="evolved" name="Zuki" onPetClick={vi.fn()} />);
    expect(screen.getByText(/evolved/i)).toBeInTheDocument();
  });

  it("T-8.4: when status is normal, neither Sick nor Evolved appears", () => {
    render(<PetDisplay status="normal" name="Zuki" onPetClick={vi.fn()} />);
    expect(screen.queryByText(/sick/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/evolved/i)).not.toBeInTheDocument();
  });
});

describe("PetDisplay — spam click detection (T-11)", () => {
  it("T-11.1: clicking fewer than 5 times in 2s does NOT call onPetClick", () => {
    const onPetClick = vi.fn();
    render(<PetDisplay status="normal" name="Zuki" onPetClick={onPetClick} />);
    const btn = screen.getByLabelText(/Pet Zuki/i);
    fireEvent.click(btn);
    fireEvent.click(btn);
    fireEvent.click(btn);
    fireEvent.click(btn);
    expect(onPetClick).not.toHaveBeenCalled();
  });

  it("T-11.2: clicking exactly 5 times in 2s calls onPetClick once", () => {
    const onPetClick = vi.fn();
    render(<PetDisplay status="normal" name="Zuki" onPetClick={onPetClick} />);
    const btn = screen.getByLabelText(/Pet Zuki/i);
    for (let i = 0; i < 5; i++) fireEvent.click(btn);
    expect(onPetClick).toHaveBeenCalledTimes(1);
  });

  it("T-11.3: after 2s window resets, 5 more clicks in new window calls onPetClick again", () => {
    const onPetClick = vi.fn();
    render(<PetDisplay status="normal" name="Zuki" onPetClick={onPetClick} />);
    const btn = screen.getByLabelText(/Pet Zuki/i);
    for (let i = 0; i < 5; i++) fireEvent.click(btn);
    expect(onPetClick).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(2_100);
    for (let i = 0; i < 5; i++) fireEvent.click(btn);
    expect(onPetClick).toHaveBeenCalledTimes(2);
  });
});
