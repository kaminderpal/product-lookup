import { render, screen } from "@testing-library/react";
import { TopNav } from "./TopNav";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => <img alt="" {...props} />,
}));

describe("TopNav", () => {
  it("renders brand and auth links", () => {
    render(<TopNav />);

    expect(screen.getByText("Product Lookup")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register");
  });
});
