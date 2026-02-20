import crypto from "node:crypto";
import walmartMarketplaceApi, {
  ItemsApi,
  defaultParams
} from "@whitebox-co/walmart-marketplace-api";

type SearchParams = {
  keyword: string;
  page?: number;
};

type WalmartItem = {
  asin: string;
  title: string;
  description?: string;
  imageUrl?: string;
  detailPageUrl?: string;
  price?: string;
};

type WalmartApiItem = {
  itemId?: string;
  title?: string;
  description?: string;
  images?: { url?: string }[];
  price?: { amount?: number | string };
};

type WalmartSearchResponse = {
  items?: WalmartApiItem[];
};

const serviceName = process.env.WALMART_SERVICE_NAME ?? "Walmart Marketplace";
const channelType = process.env.WALMART_CONSUMER_CHANNEL_TYPE;
let itemsApiPromise: Promise<ItemsApi> | null = null;

export function hasWalmartCredentials(): boolean {
  return Boolean(process.env.WALMART_CLIENT_ID?.trim() && process.env.WALMART_CLIENT_SECRET?.trim());
}

function parseItems(data: WalmartSearchResponse): WalmartItem[] {
  const items = data.items ?? [];

  return items.map((item) => ({
    asin: item.itemId ?? crypto.randomUUID(),
    title: item.title ?? "Untitled",
    description: item.description,
    imageUrl: item.images?.[0]?.url,
    detailPageUrl: item.itemId ? `https://www.walmart.com/ip/${item.itemId}` : undefined,
    price:
      item.price?.amount && Number.isFinite(Number(item.price.amount))
        ? `$${Number(item.price.amount).toFixed(2)}`
        : undefined
  }));
}

async function getItemsApi(): Promise<ItemsApi> {
  const clientId = process.env.WALMART_CLIENT_ID?.trim();
  const clientSecret = process.env.WALMART_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    const missing = [
      !clientId ? "WALMART_CLIENT_ID" : null,
      !clientSecret ? "WALMART_CLIENT_SECRET" : null
    ]
      .filter(Boolean)
      .join(", ");
    throw new Error(`Missing Walmart credentials: ${missing}`);
  }

  if (!itemsApiPromise) {
    itemsApiPromise = walmartMarketplaceApi.getConfiguredApi(ItemsApi, {
      clientId,
      clientSecret,
      serviceName,
      consumerChannelType: channelType
    });
  }
  return itemsApiPromise;
}

export async function searchWalmartProducts({ keyword }: SearchParams): Promise<WalmartItem[]> {
  const itemsApi = await getItemsApi();
  const response = await itemsApi.getSearchResult({
    ...defaultParams,
    query: keyword,
    wMQOSCORRELATIONID: crypto.randomUUID()
  });

  return parseItems(response.data);
}

export type { WalmartItem };
