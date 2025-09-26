import { Token } from "../../../../../utils/token";
import { Check, FileQuestion } from "lucide-react";

interface Props {
  asset: BazarAsset;
  isEditing: boolean;
  selectedAssets: string[];
  toggleAssetSelection: (asset: BazarAsset) => void;
}
function BazarAssetViewer({
  asset,
  isEditing,
  selectedAssets,
  toggleAssetSelection,
}: Props) {
  return (
    <div>
      {isEditing ? (
        <div
          key={asset.id}
          className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
            selectedAssets.includes(asset.id)
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => toggleAssetSelection(asset)}
        >
          <div className="aspect-square w-full rounded-lg overflow-hidden bg-muted">
            {asset.type === "token" && asset.logoImage && (
              <img
                src={`https://arweave.net/${asset.logoImage}`}
                alt={`Token ${asset.id}`}
                className="w-full h-full object-contain p-4 bg-white"
                loading="lazy"
              />
            )}
            {asset.type === "image" && !asset.logoImage && asset.id && (
              <img
                src={`https://arweave.net/${asset.id}`}
                alt={`Asset ${asset.id}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
            {asset.type === "video" && !asset.logoImage && asset.id && (
              <video
                src={`https://arweave.net/${asset.id}`}
                className="w-full h-full object-cover"
                playsInline
                controls={false}
                preload="metadata"
              />
            )}
            {asset.type === "unknown" && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <FileQuestion className="h-8 w-8" />
              </div>
            )}
          </div>

          {selectedAssets.includes(asset.id) && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
              <Check className="h-3 w-3" />
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <p className="text-xs text-white font-medium truncate">
              Qty:{" "}
              {asset.logoImage
                ? parseInt(asset.quantity) /
                  Math.pow(
                    10,
                    Token.find((t) => t.address === asset.id)?.denomination || 0
                  )
                : asset.quantity}
            </p>
          </div>
        </div>
      ) : (
        <div
          key={asset.id}
          className="aspect-square rounded-md overflow-hidden bg-muted"
        >
          {asset.type === "token" && asset.logoImage && (
            <img
              src={`https://arweave.net/${asset.logoImage}`}
              alt={`Asset ${asset.id}`}
              className="w-full h-full object-cover"
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://bazar.arweave.net/assets/${asset.id}`,
                  "_blank"
                );
              }}
            />
          )}
          {asset.type === "image" && !asset.logoImage && asset.id && (
            <img
              src={`https://arweave.net/${asset.id}`}
              alt={`Asset ${asset.id}`}
              className="w-full h-full object-cover"
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://bazar.arweave.net/assets/${asset.id}`,
                  "_blank"
                );
              }}
            />
          )}
          {asset.type === "video" && !asset.logoImage && asset.id && (
            // Make sure video is played infinite without showing controls
            <video
              src={`https://arweave.net/${asset.id}`}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://bazar.arweave.net/assets/${asset.id}`,
                  "_blank"
                );
              }}
            />
          )}
          {asset.type === "unknown" && (
            <div
              className="flex items-center justify-center h-full text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://bazar.arweave.net/assets/${asset.id}`,
                  "_blank"
                );
              }}
            >
              <FileQuestion className="h-8 w-8" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BazarAssetViewer;
