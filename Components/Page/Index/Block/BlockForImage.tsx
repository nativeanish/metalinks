// Image gallery specific implementation
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
  Trash2,
  ExternalLink,
  Edit3,
  Save,
  BarChart3,
  Copy,
} from "lucide-react";
import useBlock, { type BlockData } from "../../../../store/useBlock";
import { useCallback, useEffect, useRef, useState } from "react";
import { uuidv7 } from "uuidv7";

interface LocalImageMeta {
  id: string;
  url: string; // object URL
  name: string;
  title: string; // user provided title
  size: number;
  type: string;
}

const lsKey = (blockId: string) => `block-images-${blockId}`;

function BlockForImage({ data }: { data: BlockData }) {
  const updateBlockData = useBlock((s) => s.updateBlocks);
  const removeBlock = useBlock((s) => s.removeBlock);
  const [isEditing, setIsEditing] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState(data.title || "");
  const [description, setDescription] = useState(data.customDescription || "");
  const [images, setImages] = useState<LocalImageMeta[]>([]);
  const dragItem = useRef<string | null>(null);

  // Load any previously stored image metadata
  useEffect(() => {
    try {
      const raw = localStorage.getItem(lsKey(data.id));
      if (raw) {
        const parsed: LocalImageMeta[] = JSON.parse(raw);
        setImages(parsed);
      } else if (data.urls && data.urls.length) {
        setImages(
          data.urls.map((u) => ({
            id: uuidv7(),
            url: u,
            name: u.split("/").pop() || "image",
            title: u.split("/").pop() || "Untitled",
            size: 0,
            type: "image/*",
          }))
        );
      }
    } catch {
      /* ignore */
    }
  }, [data.id, data.urls]);

  // Persist metadata locally
  useEffect(() => {
    try {
      localStorage.setItem(lsKey(data.id), JSON.stringify(images));
    } catch {
      /* ignore */
    }
  }, [images, data.id]);

  // Clean object URLs
  useEffect(
    () => () => {
      images.forEach((img) => {
        if (img.url.startsWith("blob:")) URL.revokeObjectURL(img.url);
      });
    },
    [images]
  );

  const onSelectImages = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list) return;
      const metas: LocalImageMeta[] = [];
      for (let i = 0; i < list.length; i++) {
        const file = list.item(i)!;
        if (!file.type.startsWith("image/")) continue;
        const url = URL.createObjectURL(file);
        metas.push({
          id: uuidv7(),
          url,
          name: file.name,
          title: file.name.replace(/\.[^.]+$/, ""),
          size: file.size,
          type: file.type,
        });
      }
      setImages((prev) => [...prev, ...metas]);
      e.target.value = "";
    },
    []
  );

  const removeImage = (id: string) => {
    setImages((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found && found.url.startsWith("blob:"))
        URL.revokeObjectURL(found.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  // Drag & Drop reordering
  const onDragStart = (id: string) => (e: React.DragEvent) => {
    dragItem.current = id;
    e.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = (overId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragItem.current === overId) return;
    setImages((prev) => {
      const fromIndex = prev.findIndex((i) => i.id === dragItem.current);
      const toIndex = prev.findIndex((i) => i.id === overId);
      if (fromIndex === -1 || toIndex === -1) return prev;
      const clone = [...prev];
      const [moved] = clone.splice(fromIndex, 1);
      clone.splice(toIndex, 0, moved);
      return clone;
    });
  };
  const onDragEnd = () => {
    dragItem.current = null;
  };

  const save = () => {
    updateBlockData({
      id: data.id,
      title: galleryTitle,
      customDescription: description,
      urls: images.map((i) => i.url),
      url: images[0]?.url,
    });
    setIsEditing(false);
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
            <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                <span>
                  {images.length} image{images.length === 1 ? "" : "s"}
                </span>
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
                    onClick={() =>
                      updateBlockData({
                        id: data.id,
                        isEnabled: !data.isEnabled,
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
        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`gallery-title-${data.id}`}>
                  Gallery Title
                </Label>
                <Input
                  id={`gallery-title-${data.id}`}
                  placeholder="Enter gallery title"
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                  className="bg-muted/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`image-input-${data.id}`}>Add Images</Label>
                <Input
                  id={`image-input-${data.id}`}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={onSelectImages}
                  className="bg-muted/40"
                />
                <p className="text-[10px] text-muted-foreground">
                  Supported: png, jpg, jpeg, webp, gif (stored locally).
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`gallery-desc-${data.id}`}>Description</Label>
              <Textarea
                id={`gallery-desc-${data.id}`}
                placeholder="Describe this gallery..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-20 bg-muted/40"
              />
            </div>
            {/* Drag & Drop helper */}
            {images.length > 1 && (
              <p className="text-[10px] text-muted-foreground">
                Drag images to reorder.
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.length === 0 && (
                <div className="col-span-full text-sm text-muted-foreground italic">
                  No images yet.
                </div>
              )}
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="group relative rounded-md overflow-hidden border bg-muted/20 backdrop-blur-sm flex flex-col"
                  draggable
                  onDragStart={onDragStart(img.id)}
                  onDragOver={onDragOver(img.id)}
                  onDragEnd={onDragEnd}
                >
                  <div className="aspect-video w-full relative bg-black/5">
                    <img
                      src={img.url}
                      alt={img.title || img.name}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                    <div className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded bg-black/60 text-white">
                      {idx + 1}
                    </div>
                    <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 bg-black/40 text-white hover:bg-black/60"
                        onClick={() => removeImage(img.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 bg-black/40 text-white hover:bg-black/60"
                        onClick={() => window.open(img.url, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Input
                    value={img.title}
                    placeholder="Image title"
                    onChange={(e) =>
                      setImages((prev) =>
                        prev.map((p) =>
                          p.id === img.id ? { ...p, title: e.target.value } : p
                        )
                      )
                    }
                    className="rounded-none border-0 border-t bg-background/70 text-xs"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={save} disabled={images.length === 0}>
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {galleryTitle && (
              <p className="text-sm font-medium">{galleryTitle}</p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground whitespace-pre-line">
                {description}
              </p>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.length === 0 ? (
                <div className="col-span-full p-4 rounded-lg bg-muted/30 text-sm text-muted-foreground italic">
                  No images added.
                </div>
              ) : (
                images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative rounded-md overflow-hidden border bg-muted/20"
                  >
                    <div className="aspect-video w-full relative">
                      <img
                        src={img.url}
                        alt={img.title || img.name}
                        className="h-full w-full object-cover"
                        draggable={false}
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-1.5">
                        <p className="text-[11px] text-white font-medium truncate">
                          {img.title || img.name}
                        </p>
                      </div>
                      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 bg-black/40 text-white hover:bg-black/60"
                          onClick={() => navigator.clipboard.writeText(img.url)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 bg-black/40 text-white hover:bg-black/60"
                          onClick={() => window.open(img.url, "_blank")}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" /> Edit
                </Button>
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

export default BlockForImage;
