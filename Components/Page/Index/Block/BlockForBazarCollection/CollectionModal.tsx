import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../../../src/components/ui/dialog";
import { Button } from "../../../../../src/components/ui/button";
import { Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { CollectionDetailType } from "node_modules/@permaweb/libs/dist/types/helpers";

interface CollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: CollectionDetailType[] | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onSelectCollection: (collectionId: string) => void;
}

export function CollectionModal({
  open,
  onOpenChange,
  collections,
  isLoading,
  isError,
  error,
  onSelectCollection,
}: CollectionModalProps) {
  // Handle data states
  useEffect(() => {
    if (!isLoading && !isError && collections !== undefined) {
      if (!collections || collections.length === 0) {
        toast.error("No collections found", {
          description: "You don't have any collections on Bazar.",
        });
        onOpenChange(false);
      }
    }
  }, [collections, isLoading, isError, onOpenChange]);

  // Handle error state
  useEffect(() => {
    if (isError && error) {
      toast.error("Failed to load collections", {
        description: error.message || "Unknown error occurred",
      });
      onOpenChange(false);
    }
  }, [isError, error, onOpenChange]);

  const handleSelectCollection = (collection: CollectionDetailType) => {
    onSelectCollection(collection.id);
    onOpenChange(false);
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select a Collection</DialogTitle>
          <DialogDescription>
            Choose a collection from your Bazar profile to display
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Loading Collections</p>
                  <p className="text-xs text-muted-foreground">
                    Fetching your collections from Bazar...
                  </p>
                </div>
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">
                    Failed to Load Collections
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {error?.message || "Unknown error occurred"}
                  </p>
                </div>
              </div>
            </div>
          ) : collections && collections.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <p className="text-sm text-muted-foreground">
                {collections.length} collection
                {collections.length === 1 ? "" : "s"} found
              </p>

              <div className="space-y-3">
                {collections.map((collection) => (
                  <div
                    key={collection.id}
                    className="group cursor-pointer p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200"
                    onClick={() => handleSelectCollection(collection)}
                  >
                    <div className="flex gap-4">
                      {/* Collection Banner/Thumbnail */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {collection.thumbnail ? (
                          <img
                            src={`https://arweave.net/${collection.thumbnail}`}
                            alt={collection.title}
                            className="w-full h-full object-cover"
                          />
                        ) : collection.banner ? (
                          <img
                            src={`https://arweave.net/${collection.banner}`}
                            alt={collection.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Collection Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                            {/**@ts-expect-error Name is not defined here*/}
                            {collection.name}
                          </h3>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                            {/**@ts-expect-error THifs */}
                            {collection.assets?.length || 0} assets
                          </span>
                        </div>

                        {collection.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {truncateText(collection.description)}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>
                            Created:{" "}
                            {new Date(
                              Number(collection.dateCreated)
                            ).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">No Collections Found</p>
                  <p className="text-xs text-muted-foreground">
                    You don't have any collections on Bazar yet.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
