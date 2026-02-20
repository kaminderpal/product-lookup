import Image from "next/image";
import Link from "next/link";
import { getSuggestedMockProducts } from "@/lib/mock-products";

type ProductPageProps = {
  params: Promise<{
    asin: string;
  }>;
  searchParams: Promise<{
    title?: string;
    description?: string;
    price?: string;
    imageUrl?: string;
    detailPageUrl?: string;
    returnTo?: string;
  }>;
};

function safeDecode(value: string | undefined): string {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function ProductPage({ params, searchParams }: ProductPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const title = safeDecode(resolvedSearchParams.title) || "Product";
  const description = safeDecode(resolvedSearchParams.description);
  const price = safeDecode(resolvedSearchParams.price);
  const imageUrl = safeDecode(resolvedSearchParams.imageUrl);
  const detailPageUrl = safeDecode(resolvedSearchParams.detailPageUrl);
  const returnTo = safeDecode(resolvedSearchParams.returnTo) || "/";

  const suggestions = getSuggestedMockProducts({
    title,
    description,
    excludeAsin: resolvedParams.asin,
    limit: 10
  });

  return (
    <main className="mx-auto min-h-screen max-w-4xl p-6 md:p-10">
      <Link href={returnTo} className="mb-6 inline-block text-sm font-medium text-blue-700 hover:underline">
        Back to products
      </Link>

      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            width={700}
            height={700}
            className="h-80 w-full rounded-xl object-contain"
          />
        ) : (
          <div className="flex h-80 items-center justify-center rounded-xl bg-slate-100 text-slate-500">No image</div>
        )}

        <h1 className="mt-6 text-2xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">ASIN/ID: {resolvedParams.asin}</p>

        <p className="mt-4 text-lg font-semibold text-slate-900">{price || "Price unavailable"}</p>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-700">Description</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
          {description || "No description available for this product."}
        </p>

        <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-700">You may also like</h2>
        <div className="mt-3 -mx-1 flex gap-3 overflow-x-auto px-1 pb-2 snap-x snap-mandatory">
          {suggestions.map((product) => (
            <Link
              key={product.asin}
              href={`/products/${encodeURIComponent(product.asin)}?title=${encodeURIComponent(product.title)}&description=${encodeURIComponent(product.description ?? "")}&price=${encodeURIComponent(product.price ?? "")}&imageUrl=${encodeURIComponent(product.imageUrl ?? "")}&detailPageUrl=${encodeURIComponent(product.detailPageUrl ?? "")}&returnTo=${encodeURIComponent(returnTo)}`}
              className="min-w-[220px] max-w-[220px] shrink-0 snap-start rounded-xl border border-slate-200 p-3 transition hover:border-slate-400"
            >
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  width={220}
                  height={220}
                  className="h-36 w-full rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-36 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">
                  No image
                </div>
              )}
              <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-800">{product.title}</p>
              <p className="mt-1 text-sm text-slate-600">{product.price ?? "Price unavailable"}</p>
            </Link>
          ))}
        </div>

        {detailPageUrl ? (
          <a
            href={detailPageUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            View on Walmart
          </a>
        ) : null}
      </section>
    </main>
  );
}
