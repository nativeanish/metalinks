import useCollectionState from "../../../../../store/useCollectionState";
import useAddress from "../../../../../store/useAddress";
import permaweb from "../../../../../utils/permaweb";
import { dryrun } from "@permaweb/aoconnect";
import { toast } from "sonner";
import type { CollectionDetailType } from "node_modules/@permaweb/libs/dist/types/helpers";
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
    if (!data.Messages[0].data) {
      return false;
    }
    useCollectionState
      .getState()
      .setCollectionState(normalizedOrders(JSON.parse(data.Messages[0].Data)));
    return true;
  } catch {
    toast.error("Failed to fetch data from Bazar");
    return false;
  }
};
export const getFullCollections = async () => {
  const address = useAddress.getState().address;
  const creatorId = await permaweb.getProfileByWalletAddress(address as string);
  if (creatorId.collections && creatorId.collections.length > 0) {
    creatorId.collections = [...new Set(creatorId.collections)];
    const results = await Promise.all(
      creatorId.collections.map(async (e: string) => {
        const push = await permaweb.getCollection(e);
        return push ? { ...push, id: e } : null;
      })
    );
    const filtered = results.filter(Boolean) as Array<CollectionDetailType>;
    console.log(filtered);
    return filtered;
  }
  return null;
};

export const getCollectionwithAssets = async (
  collections: Array<CollectionDetailType>,
  collectionId: string
) => {
  const collection = collections.find((col) => col.id === collectionId);
  if (!(await setState())) {
    toast.error("Failed to Load OrderBook from Bazar");
    return false;
  }
  const data = useCollectionState.getState().state;
  if (!data?.length) {
    toast.error("Failed to Load OrderBook from Bazar");
    return false;
  } else {
    if (!collection) {
      toast.error("Collection not found");
      return false;
    }
    const filteredEntries: OrderbookEntryType[] = data.filter(
      (entry: OrderbookEntryType) => collection.assetIds.includes(entry.Pair[0])
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
          collection.assetIds.length) *
        100,
      currency: sortedEntries[0] ? sortedEntries[0].Pair[1] : null,
    };
  }
};
