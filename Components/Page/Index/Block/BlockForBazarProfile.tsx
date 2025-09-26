import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../src/components/ui/card";
import { Button } from "../../../../src/components/ui/button";
import { Separator } from "../../../../src/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../src/components/ui/tooltip";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../src/components/ui/avatar";
import { Badge } from "../../../../src/components/ui/badge";
import {
  Trash2,
  Edit3,
  Save,
  BarChart3,
  User,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import useAddress from "../../../../store/useAddress";
import useBlock, { type BlockData } from "../../../../store/useBlock";
import { fetchProfilewithAssets } from "./BazarUtils/fetchDetails";
import BazarAssetViewer from "./BazarUtils/BazarAssetViewer";
import type { BazarAsset, BazarProfile } from "../../../../src/types";

function BlockForBazarProfile({ data }: { data: BlockData }) {
  const address = useAddress((state) => state.address);
  const updateBlockData = useBlock((s) => s.updateBlocks);
  const removeBlock = useBlock((s) => s.removeBlock);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const isEnabled = data?.isEnabled ?? true;
  const blockName = data?.name ?? "Bazar Profile";
  const [_address, setAddress] = useState("");
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
        } else {
          toast.error("Failed to get Active Address");
        }
        toast.error("Failed to get Active Address");
      } catch {
        toast.error("Failed to get Active Address");
      }
    }
  }, [address, _address]);
  // Load selected assets from block data
  useEffect(() => {
    console.log(data);
    if (data?.urls && data.urls.length > 0) {
      try {
        const saved = JSON.parse(data.urls[0]);
        setSelectedAssets(saved.selectedAssets || []);
      } catch (err) {
        toast.error("Failed to load saved block data");
        console.log("Failed to parse saved block data", err);
        // ignore parsing errors
      }
    }
  }, [data]);

  const {
    data: profileData,
    isLoading,
    error,
    isError,
  } = useQuery<BazarProfile | { id: null }>({
    queryKey: ["bazar-profile", address],
    queryFn: () => fetchProfilewithAssets(_address || address || ""),
    enabled:
      !!address &&
      address.trim() !== "" &&
      !!_address &&
      _address.trim() !== "" &&
      _address == address,
    retry: 1,
  });
  useEffect(() => {
    console.log(profileData);
  }, [profileData]);
  // Handle profile not found
  useEffect(() => {
    if (profileData && "id" in profileData && profileData.id === null) {
      toast.error("No Bazar Account Found", {
        description: "This wallet address doesn't have a Bazar profile.",
        action: {
          label: "Remove Block",
          onClick: () => data?.id && removeBlock(data.id),
        },
      });
    }
  }, [profileData, removeBlock, data?.id]);

  // Handle query error
  useEffect(() => {
    if (isError && error) {
      toast.error("Failed to load Bazar profile", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }, [isError, error]);

  const toggleAssetSelection = (asset: BazarAsset) => {
    setSelectedAssets((prev) => {
      if (prev.includes(asset.id)) {
        return prev.filter((id) => id !== asset.id);
      } else if (prev.length < 5) {
        return [...prev, asset.id];
      } else {
        toast.warning("Maximum 5 assets allowed", {
          description: "You can select up to 5 assets for your profile.",
        });
        return prev;
      }
    });
  };

  const save = () => {
    const saveData = {
      selectedAssets,
      profileId: profileData && "id" in profileData ? profileData.id : null,
    };

    if (!data?.id) {
      toast.error("Can't save block", {
        description: "Block is not initialized properly.",
      });
      return;
    }

    updateBlockData({
      id: data.id,
      urls: [JSON.stringify(saveData)],
      url:
        profileData && "id" in profileData
          ? `https://bazar.arweave.dev/#/profile/${profileData.id}`
          : "",
    });
    setIsEditing(false);
  };

  // Show loading state
  if (isLoading) {
    return (
      <Card className="transition-all duration-200 border-border hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {data?.icon && <data.icon className="h-5 w-5" />}
              </div>
              <div>
                <CardTitle className="text-base">{blockName}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  Loading Bazar profile...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => data?.id && removeBlock(data.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={4}>Delete block</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <div className="space-y-2">
                <p className="text-sm font-medium">Loading Bazar Profile</p>
                <p className="text-xs text-muted-foreground">
                  Fetching profile data from Arweave...
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state or no profile found
  if (
    isError ||
    (profileData && "id" in profileData && profileData.id === null)
  ) {
    return (
      <Card className="transition-all duration-200 border-destructive/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Bazar Profile Error</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {profileData && "id" in profileData && profileData.id === null
                    ? "No Bazar account found"
                    : "Failed to load profile"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => data?.id && removeBlock(data.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Block
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  // Type guard to ensure we have a valid profile
  if (!profileData || !("id" in profileData) || !profileData.id) {
    return null;
  }
  // here overide assets from above Array<{ type: "image" | "video" | "unknown" | "token"; id: string; logoImage: string; }>
  const profile = profileData as BazarProfile & {
    assets: Array<{
      type: "image" | "video" | "unknown" | "token";
      id: string;
      logoImage: string;
      quantity: string;
    }>;
  };

  return (
    <Card
      className={`transition-all duration-200 ${
        isEnabled
          ? "border-border hover:border-primary/50"
          : "border-dashed border-muted-foreground/30 opacity-60"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg transition-colors ${
                isEnabled
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {data?.icon && <data.icon className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-base">{blockName}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Bazar NFT Profile
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                <span>{profile.assets?.length || 0} assets</span>
              </div>
            </div>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      if (!data?.id) return;
                      updateBlockData({
                        id: data.id,
                        isEnabled: !isEnabled,
                      });
                    }}
                  >
                    <div
                      className={`w-4 h-2 rounded-full transition-colors ${
                        isEnabled ? "bg-green-500" : "bg-muted-foreground"
                      }`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={4}>
                  {isEnabled ? "Disable block" : "Enable block"}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => data?.id && removeBlock(data.id)}
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
        {isEditing ? (
          <div className="space-y-6">
            {/* Profile Preview */}
            <div className="space-y-4">
              <div className="relative">
                {/* Banner */}
                {profile.banner && (
                  <div className="relative h-32 w-full rounded-lg overflow-hidden bg-muted">
                    <img
                      src={`https://arweave.net/${profile.banner}`}
                      alt="Profile banner"
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-background/60"
                      aria-hidden="true"
                    />
                  </div>
                )}

                {/* Profile Info */}
                <div
                  className={`flex items-start gap-4 ${profile.banner ? "-mt-8 relative z-10 px-4" : ""}`}
                >
                  <Avatar className="h-16 w-16 border-4 border-background">
                    <AvatarImage
                      src={
                        profile.thumbnail
                          ? `https://arweave.net/${profile.thumbnail}`
                          : undefined
                      }
                      alt={profile.displayName || profile.username}
                    />
                    <AvatarFallback>
                      <User className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                      {profile.displayName && (
                        <span className="text-lg font-semibold leading-none">
                          {profile.displayName}
                        </span>
                      )}
                      {profile.username && (
                        <span className="text-sm text-muted-foreground">
                          @{profile.username}
                        </span>
                      )}
                    </div>

                    {profile.description && (
                      <p className="text-sm">{profile.description}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">
                    Select Assets to Display
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Choose up to 5 assets to showcase ({selectedAssets.length}/5
                    selected)
                  </p>
                </div>
              </div>

              {profile.assets && profile.assets.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                  {profile.assets.map((asset) => (
                    <BazarAssetViewer
                      key={asset.id}
                      asset={asset}
                      selectedAssets={selectedAssets}
                      isEditing={true}
                      toggleAssetSelection={toggleAssetSelection}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No assets found</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={save}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Profile Display */}
            <div className="space-y-4">
              <div className="relative">
                {/* Banner */}
                {profile.banner && (
                  <div className="relative h-24 w-full rounded-lg overflow-hidden bg-muted">
                    <img
                      src={`https://arweave.net/${profile.banner}`}
                      alt="Profile banner"
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-background/80"
                      aria-hidden="true"
                    />
                  </div>
                )}

                {/* Profile Info */}
                <div
                  className={`flex items-start gap-3 ${profile.banner ? "-mt-6 relative z-10 px-3" : ""}`}
                >
                  <Avatar className="h-12 w-12 border-2 border-background">
                    <AvatarImage
                      src={
                        profile.thumbnail
                          ? `https://arweave.net/${profile.thumbnail}`
                          : undefined
                      }
                      alt={profile.displayName || profile.username}
                    />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    {(profile.displayName || profile.username) && (
                      <div className="flex flex-wrap items-baseline gap-2">
                        {profile.displayName && (
                          <span className="text-base font-semibold leading-none">
                            {profile.displayName}
                          </span>
                        )}
                        {profile.username && (
                          <span className="text-xs text-muted-foreground">
                            @{profile.username}
                          </span>
                        )}
                      </div>
                    )}
                    {profile.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {profile.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Assets Display */}
            {selectedAssets.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Featured Assets</h4>
                  <Badge variant="secondary" className="text-xs">
                    {selectedAssets.length} selected
                  </Badge>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {selectedAssets.map((assetId) => {
                    const asset = profile.assets.find((a) => a.id === assetId);
                    if (!asset) return null;
                    return (
                      <BazarAssetViewer
                        key={asset.id}
                        asset={asset}
                        selectedAssets={selectedAssets}
                        isEditing={false}
                        toggleAssetSelection={() => {}}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Profile Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{profile.assets?.length || 0} assets</span>
              <span>{profile.collections?.length || 0} collections</span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(
                      `https://bazar.arweave.dev/#/profile/${profile.id}`,
                      "_blank"
                    )
                  }
                >
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isEnabled
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isEnabled ? "Active" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BlockForBazarProfile;
