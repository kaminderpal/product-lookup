import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Home from "./page";

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
}));

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

const mockUseSearchParams = jest.requireMock("next/navigation").useSearchParams as jest.Mock;

type SearchParamMap = Record<string, string | undefined>;

function setSearchParams(values: SearchParamMap) {
  const entries = Object.entries(values).filter(([, value]) => value !== undefined) as [string, string][];
  mockUseSearchParams.mockReturnValue({
    get: (key: string) => values[key] ?? null,
    toString: () => new URLSearchParams(entries).toString(),
  });
}

function mockJsonResponse(payload: unknown, ok = true) {
  return {
    ok,
    json: async () => payload,
  };
}

describe("Home page", () => {
  beforeEach(() => {
    setSearchParams({});

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        products: [
          {
            asin: "ABC123",
            title: "Mock Product",
            description: "Mock description",
            price: "$19.99",
            imageUrl: "",
            detailPageUrl: "https://example.com/product",
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      }),
    }) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("loads default products and renders product cards", async () => {
    render(<Home />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/products?page=1&limit=20&provider=mock");
    });

    expect(await screen.findByText("Mock Product")).toBeInTheDocument();
    expect(screen.getByText("$19.99")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view details/i })).toBeInTheDocument();
  });

  it("loads using keyword from URL and falls back to page 1 when page is invalid", async () => {
    setSearchParams({ keyword: "phone", page: "0" });
    global.fetch = jest.fn().mockResolvedValue(
      mockJsonResponse({
        products: [
          {
            asin: "PHONE1",
            title: "Phone One",
            imageUrl: "",
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 21,
          totalPages: 2,
          hasNext: true,
          hasPrev: false,
        },
      })
    ) as jest.Mock;

    render(<Home />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/products?page=1&limit=20&keyword=phone");
    });

    expect(screen.getByDisplayValue("phone")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2 • 21 products")).toBeInTheDocument();
  });

  it("shows validation error when searching with an empty keyword", async () => {
    render(<Home />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/products?page=1&limit=20&provider=mock");
    });

    const form = document.querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(await screen.findByText("Enter a keyword to search.")).toBeInTheDocument();
  });

  it("searches with trimmed keyword and builds product detail link params", async () => {
    setSearchParams({});
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        mockJsonResponse({
          products: [],
          pagination: null,
        })
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          products: [
            {
              asin: "A 1",
              title: "Ultra Product",
              imageUrl: "https://img.example/a.png",
              detailPageUrl: "https://example.com/a",
            },
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          },
        })
      ) as jest.Mock;

    render(<Home />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/products?page=1&limit=20&provider=mock");
    });

    const searchInput = screen.getByPlaceholderText("Search products (e.g. premium, smart, ultra)...");
    fireEvent.change(searchInput, { target: { value: "  ultra  " } });
    fireEvent.click(await screen.findByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/products?page=1&limit=20&keyword=ultra");
    });

    const detailsLink = await screen.findByRole("link", { name: /view details/i });
    expect(detailsLink.getAttribute("href")).toContain("/products/A%201?");
    expect(detailsLink.getAttribute("href")).toContain("title=Ultra+Product");
    expect(detailsLink.getAttribute("href")).toContain("returnTo=%2F%3Fkeyword%3Dultra%26page%3D1");
  });

  it("shows API error message when response is not ok", async () => {
    global.fetch = jest.fn().mockResolvedValue(mockJsonResponse({ error: "Backend failed" }, false)) as jest.Mock;

    render(<Home />);

    expect(await screen.findByText("Backend failed")).toBeInTheDocument();
  });

  it("uses fallback request-failed message when error payload is missing", async () => {
    global.fetch = jest.fn().mockResolvedValue(mockJsonResponse({}, false)) as jest.Mock;

    render(<Home />);

    expect(await screen.findByText("Request failed")).toBeInTheDocument();
  });

  it("shows unknown error when thrown value is not an Error", async () => {
    global.fetch = jest.fn().mockRejectedValue("boom") as jest.Mock;

    render(<Home />);

    expect(await screen.findByText("Unknown error")).toBeInTheDocument();
  });

  it("supports pagination and page-mode fetches for next and previous", async () => {
    setSearchParams({ keyword: "books", page: "2" });
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        mockJsonResponse({
          products: [
            {
              asin: "BOOK2",
              title: "Book Two",
              imageUrl: "",
              price: "$10",
            },
          ],
          pagination: {
            page: 2,
            limit: 20,
            total: 60,
            totalPages: 3,
            hasNext: true,
            hasPrev: true,
          },
        })
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          products: [
            {
              asin: "BOOK3",
              title: "Book Three",
              imageUrl: "",
              price: "$12",
            },
          ],
          pagination: {
            page: 3,
            limit: 20,
            total: 60,
            totalPages: 3,
            hasNext: false,
            hasPrev: true,
          },
        })
      )
      .mockResolvedValueOnce(
        mockJsonResponse({
          products: [
            {
              asin: "BOOK2",
              title: "Book Two",
              imageUrl: "",
              price: "$10",
            },
          ],
          pagination: {
            page: 2,
            limit: 20,
            total: 60,
            totalPages: 3,
            hasNext: true,
            hasPrev: true,
          },
        })
      ) as jest.Mock;

    render(<Home />);
    await screen.findByText("Page 2 of 3 • 60 products");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/products?page=3&limit=20&keyword=books");
    });
    expect(await screen.findByText("Page 3 of 3 • 60 products")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/products?page=2&limit=20&keyword=books");
    });
  });

  it("renders image and fallback text for missing fields", async () => {
    global.fetch = jest.fn().mockResolvedValue(
      mockJsonResponse({
        products: [
          {
            asin: "NOFIELDS",
            title: "No Fields Product",
          },
          {
            asin: "WITHIMAGE",
            title: "With Image Product",
            imageUrl: "https://img.example/with-image.png",
            description: "Has description",
            price: "$99",
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      })
    ) as jest.Mock;

    render(<Home />);

    expect(await screen.findByText("No image")).toBeInTheDocument();
    expect(screen.getByText("Price unavailable")).toBeInTheDocument();
    expect(screen.getByText("Tap to view product details.")).toBeInTheDocument();
    expect(screen.getByAltText("With Image Product")).toBeInTheDocument();
  });

  it("defaults missing products/pagination and uses page 1 in product return URL", async () => {
    setSearchParams({ keyword: "desk", page: "1" });
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(
        mockJsonResponse({
          products: [
            {
              asin: "DESK1",
              title: "Desk Product",
              imageUrl: "",
            },
          ],
          pagination: null,
        })
      )
      .mockResolvedValueOnce(mockJsonResponse({})) as jest.Mock;

    render(<Home />);
    const detailsLink = await screen.findByRole("link", { name: /view details/i });
    expect(detailsLink.getAttribute("href")).toContain("returnTo=%2F%3Fkeyword%3Ddesk%26page%3D1");

    const searchInput = screen.getByPlaceholderText("Search products (e.g. premium, smart, ultra)...");
    fireEvent.change(searchInput, { target: { value: "desk" } });
    fireEvent.click(screen.getByRole("button", { name: "Search" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/products?page=1&limit=20&keyword=desk");
    });
    expect(screen.queryByRole("link", { name: /view details/i })).not.toBeInTheDocument();
  });
});
