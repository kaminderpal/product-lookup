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

const EXTRA_PRODUCT_PREFIXES = [
  "Premium",
  "Portable",
  "Smart",
  "Ultra",
  "Compact",
  "Deluxe",
  "Essential",
  "Advanced",
  "Modern",
  "Pro"
];

const EXTRA_PRODUCT_TYPES = [
  "Bluetooth Speaker",
  "Gaming Keyboard",
  "USB-C Hub",
  "Robot Vacuum",
  "Fitness Tracker",
  "Desk Lamp",
  "Webcam",
  "Power Bank",
  "Electric Kettle",
  "Noise-Canceling Earbuds"
];

const EXTRA_MOCK_PRODUCTS: MockProductSeed[] = Array.from({ length: 100 }, (_, index) => {
  const prefix = EXTRA_PRODUCT_PREFIXES[index % EXTRA_PRODUCT_PREFIXES.length];
  const type = EXTRA_PRODUCT_TYPES[index % EXTRA_PRODUCT_TYPES.length];
  const id = String(100007 + index);
  const price = (19.99 + (index % 15) * 7.5).toFixed(2);

  return {
    id,
    title: `${prefix} ${type} Model ${index + 1}`,
    price: `$${price}`,
    imageUrl: `https://picsum.photos/seed/mock-product-${id}/600/600`
  };
});

const ALL_MOCK_PRODUCTS = [...MOCK_PRODUCTS, ...EXTRA_MOCK_PRODUCTS];

export function searchMockProducts(keyword: string): WalmartItem[] {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const matches =
    normalizedKeyword.length === 0
      ? ALL_MOCK_PRODUCTS
      : ALL_MOCK_PRODUCTS.filter((product) => product.title.toLowerCase().includes(normalizedKeyword));

  return matches.map((item) => ({
    asin: item.id,
    title: item.title,
    imageUrl: item.imageUrl,
    detailPageUrl: `https://www.walmart.com/ip/${item.id}`,
    price: item.price
  }));
}
