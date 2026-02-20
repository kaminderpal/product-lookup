"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

type Product = {
  asin: string;
  title: string;
  description?: string;
  imageUrl?: string;
  detailPageUrl?: string;
  price?: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

function HomeContent() {
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState("");
  const [activeKeyword, setActiveKeyword] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  async function fetchProducts(
    page: number,
    searchKeyword: string,
    mode: "search" | "page",
    forcedProvider?: "mock" | "walmart"
  ) {
    if (mode === "search") {
      setIsSearching(true);
    } else {
      setIsPaginating(true);
    }
    setError(null);

    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: "20"
      });

      if (searchKeyword.trim()) {
        query.set("keyword", searchKeyword.trim());
      }

      if (forcedProvider) {
        query.set("provider", forcedProvider);
      }

      const response = await fetch(`/api/products?${query.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Request failed");
      }

      setProducts(payload.products ?? []);
      setPagination(payload.pagination ?? null);
    } catch (err) {
      setProducts([]);
      setPagination(null);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      if (mode === "search") {
        setIsSearching(false);
      } else {
        setIsPaginating(false);
      }
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      setError("Enter a keyword to search.");
      return;
    }
    setActiveKeyword(trimmedKeyword);
    await fetchProducts(1, trimmedKeyword, "search");
  }

  function getProductHref(product: Product): string {
    const currentPage = pagination?.page ?? 1;
    const returnTo = `/?keyword=${encodeURIComponent(activeKeyword)}&page=${currentPage}`;
    const searchParams = new URLSearchParams({
      title: product.title,
      description: product.description ?? "",
      price: product.price ?? "",
      imageUrl: product.imageUrl ?? "",
      detailPageUrl: product.detailPageUrl ?? "",
      returnTo
    });

    return `/products/${encodeURIComponent(product.asin)}?${searchParams.toString()}`;
  }

  useEffect(() => {
    const keywordFromUrl = searchParams.get("keyword")?.trim();
    const pageFromUrl = Number(searchParams.get("page") ?? "1");

    if (!keywordFromUrl) {
      setKeyword("");
      setActiveKeyword("");
      void fetchProducts(1, "", "search", "mock");
      return;
    }

    setKeyword(keywordFromUrl);
    setActiveKeyword(keywordFromUrl);
    void fetchProducts(Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1, keywordFromUrl, "search");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 md:px-6 md:py-10 lg:px-0">
      <section className="overflow-hidden py-1 md:py-2">
        <form onSubmit={handleSearch} className="flex flex-col gap-3 md:flex-row">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search products (e.g. premium, smart, ultra)..."
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none ring-blue-500 transition focus:ring"
          />
          <button
            type="submit"
            disabled={isSearching || !keyword.trim()}
            className="rounded-xl bg-slate-900 px-5 py-2.5 font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      {pagination && pagination.total > 20 ? (
        <section className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-600">
            Page {pagination.page} of {pagination.totalPages} • {pagination.total} products
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fetchProducts(Math.max(1, pagination.page - 1), activeKeyword, "page")}
              disabled={isSearching || isPaginating || !pagination.hasPrev}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => fetchProducts(pagination.page + 1, activeKeyword, "page")}
              disabled={isSearching || isPaginating || !pagination.hasNext}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      ) : null}

      <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.asin}
            href={getProductHref(product)}
            className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            {product.imageUrl ? (
              <div className="rounded-xl bg-slate-50 p-3">
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  width={300}
                  height={300}
                  className="h-52 w-full rounded-lg object-contain transition group-hover:scale-[1.02]"
                />
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
                No image
              </div>
            )}

            <h2 className="mt-4 line-clamp-2 text-sm font-semibold leading-6 text-slate-900">{product.title}</h2>
            <p className="mt-2 text-sm font-medium text-slate-800">{product.price ?? "Price unavailable"}</p>
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
              {product.description ?? "Tap to view product details."}
            </p>
            <p className="mt-3 text-sm font-medium text-blue-700 transition group-hover:text-blue-800">View details</p>
          </Link>
        ))}
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<main className="mx-auto min-h-screen max-w-6xl px-4 py-6 md:px-6 md:py-10 lg:px-0" />}>
      <HomeContent />
    </Suspense>
  );
}
