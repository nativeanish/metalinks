import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../src/components/ui/card";
import { Input } from "../../../../src/components/ui/input";
import { Label } from "../../../../src/components/ui/label";
import { Button } from "../../../../src/components/ui/button";
import { Textarea } from "../../../../src/components/ui/textarea";
import { Separator } from "../../../../src/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../src/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../src/components/ui/select";
import {
  Trash2,
  ExternalLink,
  CreditCard as Edit3,
  Save,
  ChartBar as BarChart3,
  Copy,
  Share,
  Upload,
  X,
  Link2,
} from "lucide-react";
import { useEffect, useState } from "react";
import useBlock, { type BlockData } from "../../../../store/useBlock";

type DisplayType = "button" | "image";

interface UrlBlockData {
  displayType: DisplayType;
  title: string;
  url: string;
  description: string;
  // Button specific
  buttonText: string;
  // Image specific
  imageUrl: string;
  imageName: string;
}

function BlockForUrl({ data }: { data: BlockData }) {
  const [isEditingBlock, setEditingBlock] = useState<boolean>(false);
  const updateBlockData = useBlock((state) => state.updateBlocks);
  const removeBlock = useBlock((state) => state.removeBlock);

  // Initialize block data from stored data or defaults
  const [blockData, setBlockData] = useState<UrlBlockData>(() => {
    try {
      if (data.urls && data.urls.length > 0) {
        return JSON.parse(data.urls[0]);
      }
    } catch {
      // ignore parsing errors
    }

    return {
      displayType: "button" as DisplayType,
      title: data.title || "",
      url: data.url || "",
      description: data.customDescription || "",
      buttonText: "Visit Link",
      imageUrl: "",
      imageName: "",
    };
  });

  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    if (isEditingBlock && blockData.url && blockData.url.length > 0) {
      const urlPattern = /^(http|https):\/\/[^ "]+$/;
      if (!urlPattern.test(blockData.url)) {
        setError(true);
      }
    }
  }, [blockData.url, isEditingBlock]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      return;
    }

    // Clean up previous object URL
    if (blockData.imageUrl && blockData.imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(blockData.imageUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setBlockData((prev) => ({
      ...prev,
      imageUrl: objectUrl,
      imageName: prev.imageName || file.name.replace(/\.[^.]+$/, ""),
    }));

    // Reset input
    e.target.value = "";
  };

  const removeImage = () => {
    if (blockData.imageUrl && blockData.imageUrl.startsWith("blob:")) {
      URL.revokeObjectURL(blockData.imageUrl);
    }
    setBlockData((prev) => ({
      ...prev,
      imageUrl: "",
      imageName: "",
    }));
  };

  const saveChanges = () => {
    const serializedData = JSON.stringify(blockData);

    updateBlockData({
      id: data.id,
      title: blockData.title,
      url: blockData.url,
      customDescription: blockData.description,
      urls: [serializedData],
    });
    setEditingBlock(false);
  };

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (blockData.imageUrl && blockData.imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(blockData.imageUrl);
      }
    };
  }, [blockData.imageUrl]);

  return (
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
                {data.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Stats */}
            <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                <span>0 clicks</span>
              </div>
            </div>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            <div className="flex items-center gap-1">
              {/* Toggle enable/disable with tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() =>
                      updateBlockData({
                        isEnabled: !data.isEnabled,
                        id: data.id,
                      })
                    }
                  >
                    <div
                      className={`w-4 h-2 rounded-full transition-colors ${
                        data.isEnabled ? "bg-green-500" : "bg-muted-foreground"
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
        {isEditingBlock ? (
          <div className="space-y-4">
            {/* Display Type Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Display Type</Label>
              <Select
                value={blockData.displayType}
                onValueChange={(value: DisplayType) =>
                  setBlockData((prev) => ({ ...prev, displayType: value }))
                }
              >
                <SelectTrigger className="bg-muted/40">
                  <SelectValue placeholder="Select display type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="button">Button</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor={`title-${data.id}`}
                  className="text-sm font-medium"
                >
                  Title
                </Label>
                <Input
                  id={`title-${data.id}`}
                  placeholder="Enter title"
                  value={blockData.title}
                  onChange={(e) =>
                    setBlockData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="bg-muted/40"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor={`url-${data.id}`}
                  className="text-sm font-medium"
                >
                  URL
                </Label>
                <Input
                  id={`url-${data.id}`}
                  placeholder="https://example.com"
                  value={blockData.url}
                  onChange={(e) =>
                    setBlockData((prev) => ({ ...prev, url: e.target.value }))
                  }
                  className="bg-muted/40"
                />
              </div>
            </div>

            {/* Button specific fields */}
            {blockData.displayType === "button" && (
              <div className="space-y-2">
                <Label
                  htmlFor={`button-text-${data.id}`}
                  className="text-sm font-medium"
                >
                  Button Text
                </Label>
                <Input
                  id={`button-text-${data.id}`}
                  placeholder="Visit Link"
                  value={blockData.buttonText}
                  onChange={(e) =>
                    setBlockData((prev) => ({
                      ...prev,
                      buttonText: e.target.value,
                    }))
                  }
                  className="bg-muted/40"
                />
              </div>
            )}

            {/* Image specific fields */}
            {blockData.displayType === "image" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Image Upload</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="bg-muted/40"
                    />
                    {blockData.imageUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 16:9 aspect ratio for best results
                  </p>
                </div>

                {blockData.imageUrl && (
                  <div className="space-y-2">
                    <div className="aspect-video w-full max-w-sm rounded-lg overflow-hidden bg-muted">
                      <img
                        src={blockData.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label
                    htmlFor={`image-name-${data.id}`}
                    className="text-sm font-medium"
                  >
                    Image Name
                  </Label>
                  <Input
                    id={`image-name-${data.id}`}
                    placeholder="Enter image name"
                    value={blockData.imageName}
                    onChange={(e) =>
                      setBlockData((prev) => ({
                        ...prev,
                        imageName: e.target.value,
                      }))
                    }
                    className="bg-muted/40"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor={`desc-${data.id}`}
                className="text-sm font-medium"
              >
                Description (Tooltip)
              </Label>
              <Textarea
                id={`desc-${data.id}`}
                placeholder="Add a description for this link..."
                value={blockData.description}
                onChange={(e) =>
                  setBlockData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="min-h-20 bg-muted/40"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                Please enter a valid URL (must start with http:// or https://)
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingBlock(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={saveChanges}
                className="bg-primary hover:bg-primary/90"
                disabled={error || !blockData.url}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Display based on type */}
            {blockData.displayType === "button" ? (
              <div className="space-y-3">
                {blockData.title && (
                  <h3 className="text-sm font-medium">{blockData.title}</h3>
                )}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="w-full"
                      onClick={() =>
                        blockData.url && window.open(blockData.url, "_blank")
                      }
                      disabled={!blockData.url}
                    >
                      <Link2 className="h-4 w-4 mr-2" />
                      {blockData.buttonText || "Visit Link"}
                    </Button>
                  </TooltipTrigger>
                  {blockData.description && (
                    <TooltipContent>
                      <p>{blockData.description}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
            ) : (
              <div className="space-y-3">
                {blockData.title && (
                  <h3 className="text-sm font-medium">{blockData.title}</h3>
                )}

                {blockData.imageUrl ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className="cursor-pointer group"
                        onClick={() =>
                          blockData.url && window.open(blockData.url, "_blank")
                        }
                      >
                        <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted relative">
                          <img
                            src={blockData.imageUrl}
                            alt={blockData.imageName || "Link image"}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-black/60 backdrop-blur-sm rounded-full p-2">
                              <ExternalLink className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        </div>
                        {blockData.imageName && (
                          <p className="text-sm font-medium mt-2 text-center">
                            {blockData.imageName}
                          </p>
                        )}
                      </div>
                    </TooltipTrigger>
                    {blockData.description && (
                      <TooltipContent>
                        <p>{blockData.description}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ) : (
                  <div className="aspect-video w-full rounded-lg bg-muted/30 flex items-center justify-center">
                    <div className="text-center">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No image uploaded
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* URL Display */}
            {blockData.url && (
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground truncate">
                      {blockData.url}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() =>
                        navigator.clipboard.writeText(blockData.url)
                      }
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => window.open(blockData.url, "_blank")}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingBlock(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>

                {blockData.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const shareData = {
                        title: blockData.title || "Link",
                        url: blockData.url,
                      };
                      if (navigator.share) {
                        navigator.share(shareData);
                      } else {
                        navigator.clipboard.writeText(blockData.url);
                      }
                    }}
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    data.isEnabled
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {data.isEnabled ? "Active" : "Disabled"}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BlockForUrl;
