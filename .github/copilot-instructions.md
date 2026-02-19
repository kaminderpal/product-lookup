# Copilot Instructions: Build This Project

You are helping build a **Next.js 15 + TypeScript + Tailwind CSS** app called `product-lookup`.
Generate code that matches this exact architecture and behavior.

## Goal
Create a Walmart product lookup app with:
- Search by keyword
- Server-side API route for Walmart requests
- Mock provider fallback when credentials are missing
- Product detail page
- Tailwind UI

## Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- `@whitebox-co/walmart-marketplace-api`

## Required File Structure
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/products/[asin]/page.tsx`
- `src/app/api/products/route.ts`
- `src/app/globals.css`
- `src/lib/walmart.ts`
- `src/lib/mock-products.ts`
- `next.config.ts`
- `.env.example`
- `README.md`

## Environment Variables
Use these server-only env vars:
- `WALMART_CLIENT_ID`
- `WALMART_CLIENT_SECRET`
- `WALMART_SERVICE_NAME` (default: `Walmart Marketplace`)
- `WALMART_CONSUMER_CHANNEL_TYPE` (optional)

## API Contract
Implement:
- `GET /api/products?keyword=<term>&page=1&limit=20&provider=mock|walmart`

Response shape:
```json
{
  "products": [
    {
      "asin": "string",
      "title": "string",
      "description": "string",
      "imageUrl": "string",
      "detailPageUrl": "string",
      "price": "$19.99"
    }
  ],
  "provider": "mock",
  "terms": ["wireless", "headphones"],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 120,
    "totalPages": 6,
    "hasNext": true,
    "hasPrev": false
  }
}
```

Validation rules:
- `keyword` is required
- `page` must be `>= 1`, default `1`
- `limit` default `20`, max `20`

## Provider Logic
- If `provider=mock`, always use mock data.
- If `provider=walmart`, always attempt Walmart API.
- If provider is omitted:
  - Use Walmart when credentials exist.
  - Otherwise use mock provider.

## Walmart Adapter Requirements (`src/lib/walmart.ts`)
- Configure `ItemsApi` from `@whitebox-co/walmart-marketplace-api`
- Implement credential check helper
- Implement search helper that maps Walmart response to app `Product` shape
- Use correlation IDs per request

## Mock Adapter Requirements (`src/lib/mock-products.ts`)
- Seed at least 100 mock products
- Filter by keyword (case-insensitive)
- Return app `Product` shape
- Add a suggestion helper for product detail recommendations.
- Suggestions must be relevant to the currently viewed product (use weighted scoring from title + description tokens and product-category matching, not random picks).
- Exclude the currently viewed product from suggestions.

## UI Requirements
### Home page (`src/app/page.tsx`)
- Search input + button
- Product grid cards (title, image, price, short description)
- Pagination controls (Previous/Next)
- Fetch products from `/api/products`
- Handle loading and error states
- Product cards link to `/products/[asin]` with product metadata in query params

### Product detail page (`src/app/products/[asin]/page.tsx`)
- Show image, title, asin, price, description
- Back link to previous search URL
- External button to Walmart detail page when present
- Render a horizontal carousel (`overflow-x`) of suggested products directly under the description.
- Suggested products must come from the relevance helper and be context-aware to the current product.
- Each suggestion card should include image, title, and price, and link to that suggestion's detail page.

## Images
Configure `next.config.ts` with remote image hosts:
- `picsum.photos`
- `i5.walmartimages.com`
- `i.walmartimages.com`

## Code Quality
- Keep types explicit
- Keep API secrets server-side only
- Keep client page clean and readable
- Avoid introducing extra dependencies unless necessary

## README Requirements
Include:
- setup steps (`npm install`, env setup, `npm run dev`)
- API route usage example
- provider fallback behavior
- short architecture summary
