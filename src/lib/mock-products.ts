import type { WalmartItem } from "@/lib/walmart";

type MockProductSeed = {
  id: string;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
};

const MOCK_PRODUCTS: MockProductSeed[] = [
  {
    id: "100001",
    title: "On-Ear Wireless Headphones with Noise Isolation",
    description: "Comfortable over-ear fit with Bluetooth pairing, foldable design, and long-lasting battery life.",
    price: "$39.99",
    imageUrl: "https://picsum.photos/seed/headphones/600/600"
  },
  {
    id: "100002",
    title: "12-Cup Programmable Coffee Maker",
    description: "Brews up to 12 cups with programmable start time, pause-and-serve, and reusable filter basket.",
    price: "$24.88",
    imageUrl: "https://picsum.photos/seed/coffeemaker/600/600"
  },
  {
    id: "100003",
    title: "27-inch 4K UHD Monitor",
    description: "Crisp 4K panel with slim bezels, HDMI connectivity, and vivid color profile for work and media.",
    price: "$219.00",
    imageUrl: "https://picsum.photos/seed/monitor/600/600"
  },
  {
    id: "100004",
    title: "Ergonomic Office Chair with Lumbar Support",
    description: "Adjustable seat height and lumbar support with breathable cushioning for all-day comfort.",
    price: "$129.99",
    imageUrl: "https://picsum.photos/seed/chair/600/600"
  },
  {
    id: "100005",
    title: "10-inch Android Tablet 64GB",
    description: "Portable Android tablet with 64GB storage, HD display, and fast Wi-Fi for streaming and browsing.",
    price: "$149.00",
    imageUrl: "https://picsum.photos/seed/tablet/600/600"
  },
  {
    id: "100006",
    title: "Countertop Air Fryer, 6 Quart",
    description: "Large-capacity digital air fryer with preset modes for fries, chicken, vegetables, and more.",
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
    description: `A ${prefix.toLowerCase()} ${type.toLowerCase()} designed for everyday use, reliable performance, and value-focused shopping.`,
    price: `$${price}`,
    imageUrl: `https://picsum.photos/seed/mock-product-${id}/600/600`
  };
});

const ALL_MOCK_PRODUCTS = [...MOCK_PRODUCTS, ...EXTRA_MOCK_PRODUCTS];

const STOP_WORDS = new Set([
  "with",
  "and",
  "for",
  "the",
  "this",
  "that",
  "from",
  "your",
  "you",
  "are",
  "all",
  "use",
  "designed",
  "everyday",
  "reliable",
  "performance",
  "value",
  "focused",
  "shopping",
  "model",
  "premium",
  "portable",
  "smart",
  "ultra",
  "compact",
  "deluxe",
  "essential",
  "advanced",
  "modern",
  "pro"
]);

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  audio: ["headphone", "earbud", "speaker", "noise", "bluetooth", "wireless", "audio"],
  computer: ["monitor", "keyboard", "webcam", "usb", "hub", "desk", "display", "uhd", "4k"],
  kitchen: ["coffee", "maker", "air", "fryer", "kettle", "cup", "countertop"],
  furniture: ["chair", "lumbar", "ergonomic", "office", "seat"],
  mobile: ["tablet", "android", "wifi", "storage", "portable"],
  home: ["lamp", "vacuum", "robot", "fitness", "tracker", "power", "bank"]
};

function toWalmartItem(item: MockProductSeed): WalmartItem {
  return {
    asin: item.id,
    title: item.title,
    description: item.description,
    imageUrl: item.imageUrl,
    detailPageUrl: `https://www.walmart.com/ip/${item.id}`,
    price: item.price
  };
}

export function searchMockProducts(keyword: string): WalmartItem[] {
  const normalizedKeyword = keyword.trim().toLowerCase();
  const matches =
    normalizedKeyword.length === 0
      ? ALL_MOCK_PRODUCTS
      : ALL_MOCK_PRODUCTS.filter((product) => product.title.toLowerCase().includes(normalizedKeyword));

  return matches.map(toWalmartItem);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));
}

function inferCategories(tokens: string[]): Set<string> {
  const categories = new Set<string>();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => tokens.some((token) => token.includes(keyword) || keyword.includes(token)))) {
      categories.add(category);
    }
  }

  return categories;
}

function scoreSuggestion(sourceTitle: string, sourceDescription: string, candidate: MockProductSeed): number {
  const sourceTitleTokens = tokenize(sourceTitle);
  const sourceDescriptionTokens = tokenize(sourceDescription);
  const sourceTokens = new Set([...sourceTitleTokens, ...sourceDescriptionTokens]);

  const candidateTitleTokens = tokenize(candidate.title);
  const candidateDescriptionTokens = tokenize(candidate.description);
  const candidateTokens = new Set([...candidateTitleTokens, ...candidateDescriptionTokens]);

  const sharedTitleTerms = candidateTitleTokens.filter((token) => sourceTokens.has(token)).length;
  const sharedDescriptionTerms = candidateDescriptionTokens.filter((token) => sourceTokens.has(token)).length;

  const sourceCategories = inferCategories([...sourceTokens]);
  const candidateCategories = inferCategories([...candidateTokens]);

  let categoryMatches = 0;
  sourceCategories.forEach((category) => {
    if (candidateCategories.has(category)) {
      categoryMatches += 1;
    }
  });

  return categoryMatches * 12 + sharedTitleTerms * 3 + sharedDescriptionTerms;
}

export function getSuggestedMockProducts(params: {
  title: string;
  description?: string;
  excludeAsin?: string;
  limit?: number;
}): WalmartItem[] {
  const { title, description = "", excludeAsin, limit = 10 } = params;
  const sourceTokens = tokenize(`${title} ${description}`);
  const sourceCategories = inferCategories(sourceTokens);

  const scored = ALL_MOCK_PRODUCTS
    .filter((item) => item.id !== excludeAsin)
    .map((item) => {
      const score = scoreSuggestion(title, description, item);
      return { item, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, limit)
    .map((entry) => toWalmartItem(entry.item));

  if (scored.length >= Math.min(4, limit)) {
    return scored;
  }

  const fallback = ALL_MOCK_PRODUCTS
    .filter((item) => item.id !== excludeAsin)
    .map((item) => ({
      item,
      categories: inferCategories(tokenize(`${item.title} ${item.description}`))
    }))
    .filter((entry) => {
      if (sourceCategories.size === 0) return true;
      let match = false;
      sourceCategories.forEach((category) => {
        if (entry.categories.has(category)) {
          match = true;
        }
      });
      return match;
    })
    .slice(0, limit)
    .map((entry) => toWalmartItem(entry.item));

  return fallback;
}
