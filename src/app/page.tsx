"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

type Product = {
  asin: string;
  title: string;
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

export default function Home() {
  const [keyword, setKeyword] = useState("wireless headphones");
  const [activeKeyword, setActiveKeyword] = useState("wireless headphones");
  const [isSearching, setIsSearching] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);

  async function fetchProducts(page: number, searchKeyword = activeKeyword, mode: "search" | "page" = "search") {
    if (mode === "search") {
      setIsSearching(true);
    } else {
      setIsPaginating(true);
    }
    setError(null);

    try {
      const response = await fetch(
        `/api/products?keyword=${encodeURIComponent(searchKeyword)}&page=${page}&limit=20`
      );
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
    setActiveKeyword(trimmedKeyword);
    await fetchProducts(1, trimmedKeyword, "search");
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-6 md:p-10">
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold tracking-tight">Walmart Product Lookup</h1>
        <p className="mt-2 text-sm text-slate-600">
          Search products using Walmart API via a secure server route.
        </p>

        <form onSubmit={handleSearch} className="mt-5 flex flex-col gap-3 md:flex-row">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search products (e.g. premium, smart, ultra)..."
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 outline-none ring-blue-500 transition focus:ring"
          />
          <button
            type="submit"
            disabled={isSearching || !keyword.trim()}
            className="rounded-xl bg-slate-900 px-5 py-2.5 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
          <article key={product.asin} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.title}
                width={300}
                height={300}
                className="h-56 w-full rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-56 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
                No image
              </div>
            )}

            <h2 className="mt-3 line-clamp-2 text-sm font-semibold leading-6">{product.title}</h2>
            <p className="mt-2 text-sm text-slate-700">{product.price ?? "Price unavailable"}</p>

            {product.detailPageUrl ? (
              <a
                href={product.detailPageUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-sm font-medium text-blue-700 hover:underline"
              >
                View on Walmart
              </a>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}
