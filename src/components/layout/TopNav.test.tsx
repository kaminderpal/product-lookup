import { render, screen } from "@testing-library/react";
import { TopNav } from "./TopNav";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => {
    // Remove Next.js-only prop before rendering as a plain img in tests.
    const { priority, ...rest } = props;
    void priority;
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt="" {...rest} />;
  },
}));

describe("TopNav", () => {
  it("renders brand and auth links", () => {
    render(<TopNav />);

    expect(screen.getByText("Product Lookup")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register");
  });
});
