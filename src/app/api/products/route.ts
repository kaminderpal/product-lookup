import { NextRequest, NextResponse } from "next/server";
import { searchMockProducts } from "@/lib/mock-products";
import { hasWalmartCredentials, searchWalmartProducts } from "@/lib/walmart";

export const runtime = "nodejs";

function parseSearchTerms(keyword: string): string[] {
  const terms = keyword
    .split(/[,\s]+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 0);

  return terms.length > 0 ? terms : [keyword.trim()];
}

function mergeProducts<T extends { asin: string }>(groups: T[][]): T[] {
  const merged = new Map<string, T>();

  for (const group of groups) {
    for (const item of group) {
      if (!merged.has(item.asin)) {
        merged.set(item.asin, item);
      }
    }
  }

  return Array.from(merged.values());
}

function paginateProducts<T>(items: T[], page: number, limit: number): T[] {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("keyword")?.trim();
  const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? "20");
  const provider = request.nextUrl.searchParams.get("provider");

  try {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(20, Math.floor(limit)) : 20;
    const shouldUseMock = provider === "mock" || (provider !== "walmart" && !hasWalmartCredentials());
    const terms = keyword ? parseSearchTerms(keyword) : [];

    if (!shouldUseMock && !keyword) {
      return NextResponse.json({ error: "Missing keyword query parameter" }, { status: 400 });
    }

    if (shouldUseMock) {
      const batches = terms.length > 0 ? terms.map((term) => searchMockProducts(term)) : [searchMockProducts("")];
      const merged = mergeProducts(batches);
      const products = paginateProducts(merged, safePage, safeLimit);
      const total = merged.length;
      const totalPages = Math.max(1, Math.ceil(total / safeLimit));
      return NextResponse.json({
        products,
        provider: "mock",
        terms,
        pagination: {
          page: safePage,
          limit: safeLimit,
          total,
          totalPages,
          hasNext: safePage < totalPages,
          hasPrev: safePage > 1
        }
      });
    }

    const batches = await Promise.all(terms.map((term) => searchWalmartProducts({ keyword: term, page: safePage })));
    const merged = mergeProducts(batches);
    const products = paginateProducts(merged, safePage, safeLimit);
    const total = merged.length;
    const totalPages = Math.max(1, Math.ceil(total / safeLimit));

    return NextResponse.json({
      products,
      provider: "walmart",
      terms,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
        hasNext: safePage < totalPages,
        hasPrev: safePage > 1
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
