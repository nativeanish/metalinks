import useCollectionState from "../../../../../store/useCollectionState";
import useAddress from "../../../../../store/useAddress";
import permaweb from "../../../../../utils/permaweb";
import { dryrun } from "@permaweb/aoconnect";
import { toast } from "sonner";
import { Token } from "../../../../../utils/token";
import type { CollectionDetailType } from "node_modules/@permaweb/libs/dist/types/helpers";
import { getContentTypes } from "../BazarUtils/fetchDetails";
export type AssetSortType =
  | "high-to-low"
  | "low-to-high"
  | "recently-listed"
  | "stamps";
export type EntryOrderType = {
  DepositTxId: string;
  DateCreated: string;
  OriginalQuantity: string;
  Creator: string;
  Id: string;
  Token: string;
  Quantity: string;
  Price?: string;
};

export type OrderbookEntryType = {
  Pair: string[];
  Orders?: EntryOrderType[];
  PriceData?: {
    DominantToken: string;
    Vwap: string;
    MatchLogs: {
      Id: string;
      Quantity: string;
      Price: string;
    }[];
    Block: string;
  };
};
export type StampsType = Record<string, { total: number; vouched: number }>;
function getPrice(sortedEntries: OrderbookEntryType[]) {
  if (sortedEntries && sortedEntries.length) {
    const currentEntry = sortedEntries[0];
    if (
      currentEntry.Orders &&
      currentEntry.Orders.length &&
      currentEntry.Orders[0].Price
    ) {
      return Number(currentEntry.Orders[0].Price);
    }
  } else {
    return 0;
  }
}

export function sortOrderbookEntries(
  entries: OrderbookEntryType[],
  sortType: AssetSortType,
  stamps: StampsType
): OrderbookEntryType[] {
  const getSortKey = (entry: OrderbookEntryType): number => {
    if (!entry.Orders || entry.Orders.length === 0) return Infinity;
    return Number(entry.Orders[0].Price);
  };

  const getDateKey = (entry: OrderbookEntryType): number => {
    if (!entry.Orders || entry.Orders.length === 0) return 0;
    return new Date(entry.Orders[0].DateCreated).getTime();
  };

  const getStampKey = (entry: OrderbookEntryType): number => {
    if (!stamps || !entry.Pair || entry.Pair.length === 0) return -1;
    return stamps[entry.Pair[0]]?.total ?? -1;
  };

  let direction: number;

  switch (sortType) {
    case "high-to-low":
      direction = -1;
      break;
    case "low-to-high":
      direction = 1;
      break;
    case "recently-listed":
      direction = -1;
      break;
    case "stamps":
      direction = 1;
      break;
    default:
      direction = 1;
  }

  if (sortType === "stamps") {
    return entries.sort((a, b) => {
      const stampA = getStampKey(a);
      const stampB = getStampKey(b);

      if (stampA !== stampB) {
        return direction * (stampB - stampA);
      }

      return getDateKey(b) - getDateKey(a);
    });
  }

  let entriesWithOrders = entries.filter(
    (entry) => entry.Orders && entry.Orders.length > 0
  );
  const entriesWithoutOrders = entries.filter(
    (entry) => !entry.Orders || entry.Orders.length === 0
  );

  entriesWithOrders.sort((a, b) => {
    if (sortType === "recently-listed") {
      return direction * (getDateKey(b) - getDateKey(a));
    } else {
      return direction * (getSortKey(a) - getSortKey(b));
    }
  });

  if (sortType === "recently-listed") {
    entriesWithOrders = entriesWithOrders.reverse();
  }

  return [...entriesWithOrders, ...entriesWithoutOrders];
}
//@ts-expect-error I have not defined the types
const normalizedOrders = (ucm) =>
  //@ts-expect-error I have not defined the types
  ucm?.Orderbook?.map((entry) => ({
    Pair: entry.Pair?.sort() || [],
    PriceData: entry.PriceData
      ? {
          ...entry.PriceData,
          MatchLogs: entry.PriceData.MatchLogs
            ? //@ts-expect-error I have not defined the types
              entry.PriceData.MatchLogs.map((log) => ({
                ...log,
                //@ts-expect-error I have not defined the types
              })).sort((a, b) => a.Id.localeCompare(b.Id))
            : [],
        }
      : null,
    Orders: entry.Orders
      ? //@ts-expect-error I have not defined the types
        entry.Orders.map((order) => ({
          ...order,
          //@ts-expect-error I have not defined the types
        })).sort((a, b) => a.Id.localeCompare(b.Id))
      : [],
    //@ts-expect-error I have not defined the types
  })).sort((a, b) =>
    JSON.stringify(a.Pair).localeCompare(JSON.stringify(b.Pair))
  ) || [];

const setState = async () => {
  try {
    const state = useCollectionState.getState().state;
    if (state) {
      return true;
    }
    const data = await dryrun({
      process: "hqdL4AZaFZ0huQHbAsYxdTwG6vpibK7ALWKNzmWaD4Q",
      tags: [
        {
          name: "Action",
          value: "Info",
        },
      ],
    });
    useCollectionState
      .getState()
      .setCollectionState(normalizedOrders(JSON.parse(data.Messages[0].Data)));
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};
export const getFullCollections = async () => {
  const address = useAddress.getState().address;
  if (!address) {
    toast.error("Active wallet not found. Please connect your wallet.");
    return null;
  }
  const creatorId = await permaweb.getProfileByWalletAddress(address);
  if (creatorId.collections && creatorId.collections.length > 0) {
    creatorId.collections = [...new Set(creatorId.collections)];
    const results = await Promise.all(
      creatorId.collections.map(async (e: string) => {
        const push = await permaweb.getCollection(e);
        return push ? { ...push, id: e } : null;
      })
    );
    const filtered = results.filter(Boolean) as Array<CollectionDetailType>;
    return filtered;
  }
  return null;
};

export const getCollectionAssets = async (collectionId: string) => {
  console.log("Fetching assets for collection:", collectionId);
  try {
    const collection = (await permaweb.getCollection(
      collectionId
    )) as CollectionDetailType | null;
    if (!collection || !collection.assets || collection.assets.length === 0) {
      return [];
    }

    const finalArray: Array<{
      type: "image" | "video" | "unknown" | "token";
      id: string;
      logoImage: string;
      quantity: string;
    }> = [];

    // Filter token assets
    const filteredAssets = collection.assets.filter((assetId: string) => {
      return Token.some((token) => token.address === assetId);
    });

    filteredAssets.forEach((assetId: string) => {
      finalArray.push({
        type: "token",
        id: assetId,
        logoImage: Token.find((t) => t.address === assetId)?.logo || "",
        quantity: "1", // Default quantity for collection assets
      });
    });

    // Handle remaining assets
    const remainingAssets = collection.assets.filter(
      (assetId: string) => !Token.some((token) => token.address === assetId)
    );

    if (remainingAssets.length > 0) {
      const contentTypes = await getContentTypes(remainingAssets);
      remainingAssets.forEach((assetId: string) => {
        const contentTypeEntry = contentTypes.find((ct) => ct.id === assetId);
        const contentType = contentTypeEntry
          ? contentTypeEntry.contentType
          : null;
        finalArray.push({
          type:
            contentType && contentType.startsWith("video/")
              ? "video"
              : contentType && contentType.startsWith("image/")
                ? "image"
                : "unknown",
          id: assetId,
          logoImage: "",
          quantity: "1", // Default quantity for collection assets
        });
      });
    }

    return finalArray;
  } catch (err) {
    console.error("Failed to fetch collection assets:", err);
    toast.error("Failed to fetch collection assets");
    throw new Error("Failed to fetch collection assets");
  }
};

export const getCollectionwithAssets = async (
  collections: Array<CollectionDetailType>,
  collectionId: string
) => {
  try {
    const collection = collections.find((col) => col.id === collectionId);
    await setState();
    const state = useCollectionState.getState().state;
    if (state === null || state === undefined || !state) {
      toast.error("Failed to Load OrderBook from Bazar");
      return false;
    }
    const data = useCollectionState.getState().state;
    if (data) {
      if (!collection) {
        toast.error("Collection not found");
        return false;
      }
      const filteredEntries: OrderbookEntryType[] = data.filter(
        (entry: OrderbookEntryType) => collection.assets.includes(entry.Pair[0])
      );
      const sortedEntries: OrderbookEntryType[] = sortOrderbookEntries(
        filteredEntries,
        "low-to-high",
        {}
      );
      return {
        price: getPrice(sortedEntries),
        pl:
          (filteredEntries.filter(
            (entry) => entry.Orders && entry.Orders.length > 0
          ).length /
            collection.assets.length) *
          100,
        currency: sortedEntries[0] ? sortedEntries[0].Pair[1] : null,
      };
    } else {
      toast.error("Failed to Load OrderBook from Bazar 4343");
      return false;
    }
  } catch (err) {
    console.error(err);
    toast.error("An error occurred while fetching the collection data");
    return false;
  }
};
