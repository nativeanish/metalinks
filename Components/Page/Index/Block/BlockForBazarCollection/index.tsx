import { useQuery } from "@tanstack/react-query";
import useAddress from "../../../../../store/useAddress";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { getCollectionwithAssets, getFullCollections } from "./utils";
import { CollectionModal } from "./CollectionModal";
import useBlock, { type BlockData } from "../../../../../store/useBlock";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../src/components/ui/card";
import { Button } from "../../../../../src/components/ui/button";
import { Separator } from "../../../../../src/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../../src/components/ui/tooltip";
import { Badge } from "../../../../../src/components/ui/badge";
import {
  Trash2,
  Edit3,
  BarChart3,
  ExternalLink,
  TrendingUp,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import type { CollectionDetailType } from "node_modules/@permaweb/libs/dist/types/helpers";
import { Token } from "../../../../../utils/token";

interface BlockForBazarCollectionProps {
  data: BlockData;
}

type CollectionMetrics = {
  price: number | null;
  pl: number | null;
  currency: string | null;
};

type ExtendedCollectionDetail = CollectionDetailType & {
  assets?: Array<unknown>;
  assetIds?: string[];
  banner?: string;
  thumbnail?: string;
  title?: string;
  name?: string;
  description?: string;
  dateCreated?: string;
};

export default function BlockForBazarCollection({
  data,
}: BlockForBazarCollectionProps) {
  const address = useAddress((state) => state.address);
  const updateBlockData = useBlock((s) => s.updateBlocks);
  const removeBlock = useBlock((s) => s.removeBlock);
  const [_address, setAddress] = useState("");
  const [collectionId, setCollectionId] = useState(() => data.urls?.[0] ?? "");
  const [showModal, setShowModal] = useState(() => !data.urls?.[0]);
  const pendingSelectionRef = useRef(false);
  useEffect(() => {
    if (address) {
      run();
    }
    async function run() {
      try {
        const __address = await window.arweaveWallet.getActiveAddress();
        if (__address) {
          setAddress(__address);
          return;
        }
        toast.error("Failed to get Active Address");
      } catch {
        toast.error("Failed to get Active Address");
      }
    }
  }, [address, _address]);

  const getMultipleCollectionQuery = useQuery({
    queryKey: ["bazar-collection", address],
    queryFn: () => getFullCollections(),
    enabled:
      !!address &&
      address.trim() !== "" &&
      !!_address &&
      _address.trim() !== "" &&
      _address === address &&
      (showModal || !!collectionId),
    retry: 1,
  });

  const getSingleCollectionQuery = useQuery({
    queryKey: ["bazar-collection-single", collectionId],
    queryFn: () =>
      getCollectionwithAssets(
        getMultipleCollectionQuery.data || [],
        collectionId
      ),
    enabled:
      !!collectionId &&
      collectionId.trim() !== "" &&
      !!getMultipleCollectionQuery.data,
    retry: 1,
  });

  useEffect(() => {
    if (getSingleCollectionQuery.isError && getSingleCollectionQuery.error) {
      toast.error("Failed to load collection metrics", {
        description: "Unable to fetch collection data from Bazar",
        action: {
          label: "Remove Block",
          onClick: () => removeBlock(data.id),
        },
      });
    }
  }, [
    getSingleCollectionQuery.isError,
    getSingleCollectionQuery.error,
    removeBlock,
    data.id,
  ]);

  const collectionMetrics =
    getSingleCollectionQuery.data &&
    typeof getSingleCollectionQuery.data === "object" &&
    !Array.isArray(getSingleCollectionQuery.data)
      ? (getSingleCollectionQuery.data as CollectionMetrics)
      : null;

  const tokenInfo = useMemo(() => {
    if (!collectionMetrics?.currency) {
      return null;
    }
    return Token.find((t) => t.address === collectionMetrics.currency) ?? null;
  }, [collectionMetrics?.currency]);

  const formattedPrice = useMemo(() => {
    const price = collectionMetrics?.price;
    if (typeof price !== "number" || Number.isNaN(price) || !tokenInfo) {
      return "N/A";
    }
    return price / Math.pow(10, tokenInfo.denomination);
  }, [collectionMetrics?.price, tokenInfo]);

  const handleSelectCollection = (selectedCollectionId: string) => {
    pendingSelectionRef.current = true;
    setCollectionId(selectedCollectionId);
    updateBlockData({
      id: data.id,
      url: `https://bazar.arweave.dev/#/collection/${selectedCollectionId}`,
      urls: [selectedCollectionId],
    });
  };

  const handleModalClose = (open: boolean) => {
    setShowModal(open);
    if (!open) {
      if (pendingSelectionRef.current) {
        pendingSelectionRef.current = false;
        return;
      }

      if (!collectionId) {
        removeBlock(data.id);
      }
    }
  };

  useEffect(() => {
    if (collectionId) {
      pendingSelectionRef.current = false;
    }
  }, [collectionId]);

  const handleEdit = () => {
    setShowModal(true);
  };

  const formatPercentage = (percentage: number | null | undefined) => {
    if (typeof percentage !== "number" || Number.isNaN(percentage)) {
      return "N/A";
    }
    return `${percentage.toFixed(1)}%`;
  };

  const selectedCollection = getMultipleCollectionQuery.data?.find(
    (entry: CollectionDetailType) => entry.id === collectionId
  ) as ExtendedCollectionDetail | undefined;

  const assetCount =
    selectedCollection?.assets && Array.isArray(selectedCollection.assets)
      ? selectedCollection.assets.length
      : (selectedCollection?.assetIds?.length ?? 0);

  const createdDate = selectedCollection?.dateCreated
    ? new Date(Number(selectedCollection.dateCreated)).toLocaleDateString()
    : null;

  return (
    <>
      <CollectionModal
        open={showModal}
        onOpenChange={handleModalClose}
        collections={getMultipleCollectionQuery.data}
        isLoading={getMultipleCollectionQuery.isLoading}
        isError={getMultipleCollectionQuery.isError}
        error={getMultipleCollectionQuery.error}
        onSelectCollection={handleSelectCollection}
      />

      {collectionId && collectionId.trim() !== "" && (
        <Card
          className={`transition-all duration-200 ${
            data.isEnabled
              ? "border-border hover:border-primary/50"
              : "border-dashed border-muted-foreground/30 opacity-60"
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    data.isEnabled
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {data.icon && <data.icon className="h-5 w-5" />}
                </div>
                <div>
                  <CardTitle className="text-base">{data.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bazar NFT Collection
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    <span>Collection</span>
                  </div>
                </div>
                <Separator
                  orientation="vertical"
                  className="h-6 hidden sm:block"
                />
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateBlockData({
                            id: data.id,
                            isEnabled: !data.isEnabled,
                          })
                        }
                      >
                        <div
                          className={`w-4 h-2 rounded-full transition-colors ${
                            data.isEnabled
                              ? "bg-green-500"
                              : "bg-muted-foreground"
                          }`}
                        />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={4}>
                      {data.isEnabled ? "Disable block" : "Enable block"}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeBlock(data.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={4}>Delete block</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {getSingleCollectionQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Fetching Collection Data
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Loading metrics and market data...
                    </p>
                  </div>
                </div>
              </div>
            ) : getSingleCollectionQuery.isError ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-destructive">
                      Failed to Load Collection
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Unable to fetch collection metrics
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeBlock(data.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Block
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedCollection && (
                  <div className="space-y-4">
                    <div className="relative">
                      {selectedCollection.banner && (
                        <div className="relative h-24 w-full rounded-lg overflow-hidden bg-muted">
                          <img
                            src={`https://arweave.net/${selectedCollection.banner}`}
                            alt="Collection banner"
                            className="w-full h-full object-cover"
                          />
                          <div
                            className="pointer-events-none absolute inset-0 bg-background/60"
                            aria-hidden="true"
                          />
                        </div>
                      )}

                      <div
                        className={`flex items-start gap-3 ${
                          selectedCollection.banner
                            ? "-mt-6 relative z-10 px-3"
                            : ""
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border-2 border-background">
                          {selectedCollection.thumbnail ? (
                            <img
                              src={`https://arweave.net/${selectedCollection.thumbnail}`}
                              alt={selectedCollection.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-1">
                          <h3 className="text-base font-semibold">
                            {selectedCollection.name ||
                              selectedCollection.title}
                          </h3>
                          {selectedCollection.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {selectedCollection.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium">Floor Price</span>
                    </div>

                    <p className="text-sm font-semibold flex items-center">
                      {formattedPrice}
                      {tokenInfo?.logo ? (
                        <img
                          src={`https://arweave.net/${tokenInfo.logo}`}
                          alt="Token logo"
                          className="w-4 h-4 ml-1"
                        />
                      ) : null}
                    </p>
                  </div>

                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium">Listed</span>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatPercentage(collectionMetrics?.pl)}
                    </p>
                  </div>
                </div>

                {selectedCollection && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{assetCount} assets</span>
                    {createdDate && <span>Created: {createdDate}</span>}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Change Collection
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://bazar.arweave.dev/#/collection/${collectionId}`,
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Bazar
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={data.isEnabled ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {data.isEnabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
