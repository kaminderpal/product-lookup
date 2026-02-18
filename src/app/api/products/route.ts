import { NextRequest, NextResponse } from "next/server";
import { searchMockProducts } from "@/lib/mock-products";
import { hasWalmartCredentials, searchWalmartProducts } from "@/lib/walmart";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("keyword")?.trim();
  const page = Number(request.nextUrl.searchParams.get("page") ?? "1");
  const provider = request.nextUrl.searchParams.get("provider");

  if (!keyword) {
    return NextResponse.json({ error: "Missing keyword query parameter" }, { status: 400 });
  }

  try {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const shouldUseMock = provider === "mock" || (provider !== "walmart" && !hasWalmartCredentials());

    if (shouldUseMock) {
      const products = searchMockProducts(keyword, safePage);
      return NextResponse.json({ products, provider: "mock" });
    }

    const products = await searchWalmartProducts({ keyword, page: safePage });
    return NextResponse.json({ products, provider: "walmart" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
