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
import {
  Trash2,
  ExternalLink,
  Edit3,
  Save,
  BarChart3,
  Copy,
  Share,
} from "lucide-react";
import { Separator } from "../../../../src/components/ui/separator";
import { useEffect, useState } from "react";
import useBlock, { type BlockData } from "../../../../store/useBlock";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../src/components/ui/tooltip";
function BlockForMU({ data }: { data: BlockData }) {
  const [isEditingBlock, setEditingBlock] = useState<boolean>(false);
  const updateBlockData = useBlock((state) => state.updateBlocks);
  const removeBlock = useBlock((state) => state.removeBlock);
  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description);
  // local state for multiple urls; seed from data.urls or single data.url
  const [urls, setUrls] = useState<string[]>(() => {
    if (data.urls && data.urls.length > 0) return [...data.urls];
    if (data.url) return [data.url];
    return [""]; // start with one empty handle
  });
  const [error, setError] = useState(false);
  useEffect(() => {
    setError(false);
    if (isEditingBlock) {
      // validate each non-empty url
      const urlPattern = /^(http|https):\/\/[^ "]+$/;
      const invalid = urls.some(
        (u) => u.trim().length > 0 && !urlPattern.test(u.trim())
      );
      if (invalid) setError(true);
    }
  }, [urls, isEditingBlock]);
  const saveChanges = () => {
    const cleaned = urls.map((u) => u.trim()).filter((u) => u.length > 0);
    updateBlockData({
      title,
      description,
      url: cleaned[0],
      urls: cleaned,
      id: data.id,
    });
    setEditingBlock(false);
  };
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor={`title-${data.id}`}
                    className="text-sm font-medium"
                  >
                    Display Title
                  </Label>
                  <Input
                    id={`title-${data.id}`}
                    placeholder={`Enter ${data.name} title`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-muted/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {data.name === "Email" ? "Email Address" : "Link Handle"}
                  </Label>
                  {/* Only show count here */}
                  <div className="text-xs text-muted-foreground">
                    Links: {urls.filter((u) => u.trim()).length || 0}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {urls.map((u, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <Input
                      id={`url-${data.id}-${idx}`}
                      placeholder={
                        data.name === "Email"
                          ? "your@email.com"
                          : data.name === "Telegram"
                            ? "https://t.me/username"
                            : data.name === "X (Twitter)"
                              ? "https://x.com/username"
                              : `Enter ${data.name} URL ${idx === 0 ? "" : `#${idx + 1}`}`
                      }
                      value={u}
                      onChange={(e) => {
                        setUrls((prev) =>
                          prev.map((p, i) => (i === idx ? e.target.value : p))
                        );
                      }}
                      className="bg-muted/40 flex-1"
                    />
                    {idx > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() =>
                          setUrls((prev) => prev.filter((_, i) => i !== idx))
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUrls((prev) => [...prev, ""])}
                    disabled={urls.some((u) => u.trim() === "")}
                  >
                    Add another link
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`desc-${data.id}`}
                className="text-sm font-medium"
              >
                Custom Description (Tooltip)
              </Label>
              <Textarea
                id={`desc-${data.id}`}
                placeholder="Add a custom description for this block..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
                onClick={() => saveChanges()}
                className="bg-primary hover:bg-primary/90"
                disabled={error}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* URL(s) Display */}
            <div className="space-y-2">
              {(data.urls && data.urls.length > 0
                ? data.urls
                : data.url
                  ? [data.url]
                  : []
              ).length > 0 ? (
                (data.urls && data.urls.length > 0
                  ? data.urls
                  : data.url
                    ? [data.url]
                    : []
                ).map((u, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground truncate">
                        {u}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => navigator.clipboard.writeText(u || "")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => window.open(u, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground italic">
                    No URL configured
                  </span>
                </div>
              )}
            </div>

            {/* Custom title and description */}
            {(data.title || data.customDescription) && (
              <div className="space-y-2">
                {data.title && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Title:
                    </span>
                    <p className="text-sm font-medium">{data.title}</p>
                  </div>
                )}
                {data.customDescription && (
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Description:
                    </span>
                    <p className="text-sm text-foreground">
                      {data.customDescription}
                    </p>
                  </div>
                )}
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

                {(data.urls && data.urls.length > 0
                  ? data.urls[0]
                  : data.url) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const shareData = {
                        title: data.title || data.name,
                        url:
                          (data.urls && data.urls.length > 0
                            ? data.urls[0]
                            : data.url) || "",
                      };
                      if (navigator.share) {
                        navigator.share(shareData);
                      } else {
                        navigator.clipboard.writeText(shareData.url || "");
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

export default BlockForMU;
