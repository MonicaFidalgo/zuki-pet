import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "./MessageBubble";

describe("MessageBubble (T-10)", () => {
  it("T-10.1: renders nothing when message is null", () => {
    const { container } = render(<MessageBubble message={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("T-10.2: renders message text when non-null string", () => {
    render(<MessageBubble message="Hello Zuki" />);
    expect(screen.getByText("Hello Zuki")).toBeInTheDocument();
  });

  it("T-10.3: updating from string to null removes text", () => {
    const { rerender } = render(<MessageBubble message="Hello" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    rerender(<MessageBubble message={null} />);
    expect(screen.queryByText("Hello")).not.toBeInTheDocument();
  });
});
