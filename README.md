# Walmart Product Lookup (Next.js + Tailwind CSS)
[![CI](https://github.com/kaminderpal/product-lookup/actions/workflows/ci.yml/badge.svg)](https://github.com/kaminderpal/product-lookup/actions/workflows/ci.yml)

This project is a Next.js app with Tailwind CSS that searches Walmart products via Walmart API endpoints.
It uses the open-source `@whitebox-co/walmart-marketplace-api` SDK.

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment

```bash
cp .env.example .env.local
```

Set these values in `.env.local`:

- `WALMART_CLIENT_ID`
- `WALMART_CLIENT_SECRET`
- `WALMART_SERVICE_NAME` (default: `Walmart Marketplace`)
- `WALMART_CONSUMER_CHANNEL_TYPE` (optional)

## 3. Run the app

```bash
npm run dev
```

Open http://localhost:3000.

## API route

`GET /api/products?keyword=wireless+headphones&page=1`

Returns:

```json
{
  "products": [
    {
      "asin": "123456789",
      "title": "Sample Product",
      "imageUrl": "https://i5.walmartimages.com/...",
      "detailPageUrl": "https://www.walmart.com/ip/...",
      "price": "$19.99"
    }
  ]
}
```

Provider behavior:
- If Walmart credentials are present, default provider is `walmart`.
- If Walmart credentials are missing, default provider is `mock`.
- You can override with `provider=mock` or `provider=walmart`.

## Notes

- Credentials are used only on the server route and are not exposed to the browser.
- If your Walmart account requires additional headers or scopes, set `WALMART_CONSUMER_CHANNEL_TYPE` and adjust `src/lib/walmart.ts` accordingly.
- SDK reference: `@whitebox-co/walmart-marketplace-api`
