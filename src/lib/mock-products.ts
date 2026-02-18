import type { WalmartItem } from "@/lib/walmart";

type MockProductSeed = {
  id: string;
  title: string;
  price: string;
  imageUrl: string;
};

const MOCK_PRODUCTS: MockProductSeed[] = [
  {
    id: "100001",
    title: "On-Ear Wireless Headphones with Noise Isolation",
    price: "$39.99",
    imageUrl: "/mock-product.svg"
  },
  {
    id: "100002",
    title: "12-Cup Programmable Coffee Maker",
    price: "$24.88",
    imageUrl: "/mock-product.svg"
  },
  {
    id: "100003",
    title: "27-inch 4K UHD Monitor",
    price: "$219.00",
    imageUrl: "/mock-product.svg"
  },
  {
    id: "100004",
    title: "Ergonomic Office Chair with Lumbar Support",
    price: "$129.99",
    imageUrl: "/mock-product.svg"
  },
  {
    id: "100005",
    title: "10-inch Android Tablet 64GB",
    price: "$149.00",
    imageUrl: "/mock-product.svg"
  },
  {
    id: "100006",
    title: "Countertop Air Fryer, 6 Quart",
    price: "$59.99",
    imageUrl: "/mock-product.svg"
  }
];

export function searchMockProducts(keyword: string, page = 1): WalmartItem[] {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const filtered =
    normalizedKeyword.length === 0
      ? MOCK_PRODUCTS
      : MOCK_PRODUCTS.filter((product) => product.title.toLowerCase().includes(normalizedKeyword));

  const pageSize = 10;
  const start = Math.max(0, (page - 1) * pageSize);
  const pageItems = filtered.slice(start, start + pageSize);

  return pageItems.map((item) => ({
    asin: item.id,
    title: item.title,
    imageUrl: item.imageUrl,
    detailPageUrl: `https://www.walmart.com/ip/${item.id}`,
    price: item.price
  }));
}
