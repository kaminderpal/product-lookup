import Image from "next/image";
import Link from "next/link";

type ProductPageProps = {
  params: {
    asin: string;
  };
  searchParams: {
    title?: string;
    description?: string;
    price?: string;
    imageUrl?: string;
    detailPageUrl?: string;
    returnTo?: string;
  };
};

function safeDecode(value: string | undefined): string {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function ProductPage({ params, searchParams }: ProductPageProps) {
  const title = safeDecode(searchParams.title) || "Product";
  const description = safeDecode(searchParams.description);
  const price = safeDecode(searchParams.price);
  const imageUrl = safeDecode(searchParams.imageUrl);
  const detailPageUrl = safeDecode(searchParams.detailPageUrl);
  const returnTo = safeDecode(searchParams.returnTo) || "/";

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
        <p className="mt-2 text-sm text-slate-500">ASIN/ID: {params.asin}</p>

        <p className="mt-4 text-lg font-semibold text-slate-900">{price || "Price unavailable"}</p>

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-700">Description</h2>
        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">
          {description || "No description available for this product."}
        </p>

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
