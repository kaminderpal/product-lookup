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
    imageUrl: "https://picsum.photos/seed/headphones/600/600"
  },
  {
    id: "100002",
    title: "12-Cup Programmable Coffee Maker",
    price: "$24.88",
    imageUrl: "https://picsum.photos/seed/coffeemaker/600/600"
  },
  {
    id: "100003",
    title: "27-inch 4K UHD Monitor",
    price: "$219.00",
    imageUrl: "https://picsum.photos/seed/monitor/600/600"
  },
  {
    id: "100004",
    title: "Ergonomic Office Chair with Lumbar Support",
    price: "$129.99",
    imageUrl: "https://picsum.photos/seed/chair/600/600"
  },
  {
    id: "100005",
    title: "10-inch Android Tablet 64GB",
    price: "$149.00",
    imageUrl: "https://picsum.photos/seed/tablet/600/600"
  },
  {
    id: "100006",
    title: "Countertop Air Fryer, 6 Quart",
    price: "$59.99",
    imageUrl: "https://picsum.photos/seed/airfryer/600/600"
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
