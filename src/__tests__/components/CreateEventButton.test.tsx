/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import CreateEventButton from "@/components/CreateEventButton";
import { useSession } from "next-auth/react";

jest.mock("next-auth/react");

describe("CreateEventButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should not render for regular USER role", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: "USER" } },
      status: "authenticated",
    });

    const { container } = render(<CreateEventButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should not render for unauthenticated users", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    const { container } = render(<CreateEventButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should not render while loading", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "loading",
    });

    const { container } = render(<CreateEventButton />);
    expect(container).toBeEmptyDOMElement();
  });

  it("should render for CLUB_ADMIN users", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: "CLUB_ADMIN" } },
      status: "authenticated",
    });

    render(<CreateEventButton />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("type", "button");
    expect(screen.getByText("CREATE EVENT")).toBeInTheDocument();
  });

  it("should render for SUPER_ADMIN users", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: "SUPER_ADMIN" } },
      status: "authenticated",
    });

    render(<CreateEventButton />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(screen.getByText("CREATE EVENT")).toBeInTheDocument();
  });

  it("should have correct styling classes", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: "SUPER_ADMIN" } },
      status: "authenticated",
    });

    render(<CreateEventButton />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass(
      "inline-block",
      "bg-red-600",
      "text-white",
      "rounded-lg",
      "hover:bg-red-700",
      "transition",
      "font-semibold",
      "shadow-sm",
      "hover:shadow-md"
    );
  });

  it("should show different text on mobile", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { role: "CLUB_ADMIN" } },
      status: "authenticated",
    });

    render(<CreateEventButton />);

    expect(screen.getByText("CREATE EVENT")).toHaveClass("hidden", "md:inline");
    expect(screen.getByText("Create Event")).toHaveClass("md:hidden");
  });
});
