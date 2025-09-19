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
import { useCallback, useEffect, useState } from "react";
import { uuidv7 } from "uuidv7";

interface LocalFileMeta {
  id: string; // local id
  url: string; // object URL
  name: string; // original file name
  title: string; // user defined title
  size: number;
  type: string;
}

// Local storage key helper
const lsKey = (blockId: string) => `block-files-${blockId}`;

function BlockForFile({ data }: { data: BlockData }) {
  const [isEditing, setIsEditing] = useState(false);
  const updateBlockData = useBlock((s) => s.updateBlocks);
  const removeBlock = useBlock((s) => s.removeBlock);
  const [blockTitle, setBlockTitle] = useState<string>(data.title || "");
  const [description, setDescription] = useState<string>(
    data.customDescription || ""
  );
  const [files, setFiles] = useState<LocalFileMeta[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(lsKey(data.id));
      if (raw) {
        const parsed: LocalFileMeta[] = JSON.parse(raw);
        setFiles(parsed);
      } else if (data.urls && data.urls.length) {
        // Seed from existing urls (no titles known yet)
        setFiles(
          data.urls.map((u) => ({
            id: uuidv7(),
            url: u,
            name: u.split("/").pop() || "file",
            title: u.split("/").pop() || "Untitled",
            size: 0,
            type: "",
          }))
        );
      }
    } catch {
      // ignore
    }
  }, [data.id, data.urls]);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(lsKey(data.id), JSON.stringify(files));
    } catch {
      // ignore persistence errors
    }
  }, [files, data.id]);

  // Cleanup object URLs on unmount / file removal
  useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.url.startsWith("blob:")) URL.revokeObjectURL(f.url);
      });
    };
  }, [files]);

  const onSelectFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (!list) return;
      const newMetas: LocalFileMeta[] = [];
      for (let i = 0; i < list.length; i++) {
        const file = list.item(i)!;
        const objectUrl = URL.createObjectURL(file);
        newMetas.push({
          id: uuidv7(),
          url: objectUrl,
          name: file.name,
          // initial title: strip extension
          title: file.name.replace(/\.[^.]+$/, ""),
          size: file.size,
          type: file.type,
        });
      }
      setFiles((prev) => [...prev, ...newMetas]);
      // reset input
      e.target.value = "";
    },
    []
  );

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file && file.url.startsWith("blob:")) URL.revokeObjectURL(file.url);
      return prev.filter((f) => f.id !== id);
    });
  };

  const save = () => {
    // Only push URLs to global store as requested
    updateBlockData({
      id: data.id,
      title: blockTitle,
      customDescription: description,
      urls: files.map((f) => f.url),
      url: files[0]?.url,
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
                  {files.length} file{files.length === 1 ? "" : "s"}
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
                <Label htmlFor={`block-title-${data.id}`}>Block Title</Label>
                <Input
                  id={`block-title-${data.id}`}
                  placeholder="Enter block title"
                  value={blockTitle}
                  onChange={(e) => setBlockTitle(e.target.value)}
                  className="bg-muted/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`file-input-${data.id}`}>Add Files</Label>
                <Input
                  id={`file-input-${data.id}`}
                  type="file"
                  multiple
                  onChange={onSelectFiles}
                  className="bg-muted/40"
                />
                <p className="text-[10px] text-muted-foreground">
                  You can select multiple files (stored locally, not uploaded).
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`desc-${data.id}`}>Description (optional)</Label>
              <Textarea
                id={`desc-${data.id}`}
                placeholder="Describe these files..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-20 bg-muted/40"
              />
            </div>
            <div className="space-y-3">
              {files.length === 0 && (
                <div className="text-sm text-muted-foreground italic">
                  No files added yet.
                </div>
              )}
              {files.map((f, idx) => (
                <div
                  key={f.id}
                  className="flex flex-col sm:flex-row gap-2 p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {idx + 1}
                      </span>
                      <span className="text-xs text-muted-foreground truncate">
                        {f.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {(f.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <Input
                      value={f.title}
                      placeholder="File title"
                      onChange={(e) =>
                        setFiles((prev) =>
                          prev.map((p) =>
                            p.id === f.id ? { ...p, title: e.target.value } : p
                          )
                        )
                      }
                      className="bg-background/50"
                    />
                  </div>
                  <div className="flex items-start gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => removeFile(f.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(f.url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
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
              <Button size="sm" onClick={save} disabled={files.length === 0}>
                <Save className="h-4 w-4 mr-2" /> Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {blockTitle && (
              <div>
                <p className="text-sm font-medium">{blockTitle}</p>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground whitespace-pre-line">
                {description}
              </p>
            )}
            <div className="space-y-2">
              {files.length === 0 ? (
                <div className="p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground italic">
                  No files added.
                </div>
              ) : (
                files.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {f.title || f.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {f.name}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => navigator.clipboard.writeText(f.url)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => window.open(f.url, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
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

export default BlockForFile;
