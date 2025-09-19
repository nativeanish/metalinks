import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../src/components/ui/card";
import { Button } from "../../../../src/components/ui/button";
import { Textarea } from "../../../../src/components/ui/textarea";
import { Label } from "../../../../src/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../src/components/ui/tooltip";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../../../../src/components/ui/select";
import useBlock, { type BlockData } from "../../../../store/useBlock";
import { Trash2, Save, Edit3 } from "lucide-react";

// Utility mapping for tailwind classes
const sizeMap: Record<NonNullable<BlockData["textSize"]>, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
};
const fontMap: Record<NonNullable<BlockData["textFont"]>, string> = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
};
const alignMap: Record<NonNullable<BlockData["textAlign"]>, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function BlockForText({ data }: { data: BlockData }) {
  const updateBlockData = useBlock((s) => s.updateBlocks);
  const removeBlock = useBlock((s) => s.removeBlock);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(data.textContent || "");
  const [size, setSize] = useState<NonNullable<BlockData["textSize"]>>(
    data.textSize || "base"
  );
  const [font, setFont] = useState<NonNullable<BlockData["textFont"]>>(
    data.textFont || "sans"
  );
  const [align, setAlign] = useState<NonNullable<BlockData["textAlign"]>>(
    data.textAlign || "left"
  );
  const [color, setColor] = useState<string>(data.textColor || "#000000");

  const save = () => {
    updateBlockData({
      id: data.id,
      textContent: text,
      textSize: size,
      textFont: font,
      textAlign: align,
      textColor: color,
    });
    setEditing(false);
  };

  return (
    <Card
      className={`transition-all duration-200 ${data.isEnabled ? "border-border hover:border-primary/50" : "border-dashed border-muted-foreground/30 opacity-60"}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg transition-colors ${data.isEnabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
            >
              {data.icon && <data.icon className="h-5 w-5" />}
            </div>
            <div>
              <CardTitle className="text-base">{data.name}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Plain Text Block
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() =>
                    updateBlockData({ id: data.id, isEnabled: !data.isEnabled })
                  }
                >
                  <div
                    className={`w-4 h-2 rounded-full transition-colors ${data.isEnabled ? "bg-green-500" : "bg-muted-foreground"}`}
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
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Size</Label>
                <Select
                  value={size}
                  onValueChange={(v) =>
                    setSize(v as NonNullable<BlockData["textSize"]>)
                  }
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="base">Base</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">XL</SelectItem>
                    <SelectItem value="2xl">2XL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Font</Label>
                <Select
                  value={font}
                  onValueChange={(v) =>
                    setFont(v as NonNullable<BlockData["textFont"]>)
                  }
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sans">Sans</SelectItem>
                    <SelectItem value="serif">Serif</SelectItem>
                    <SelectItem value="mono">Mono</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Align</Label>
                <Select
                  value={align}
                  onValueChange={(v) =>
                    setAlign(v as NonNullable<BlockData["textAlign"]>)
                  }
                >
                  <SelectTrigger size="sm" className="w-full">
                    <SelectValue placeholder="Select align" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Color</Label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-full rounded-md border bg-muted/40 p-1"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Text</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text..."
                className="min-h-32 bg-muted/40"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => save()}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Center text viewer directly under header */}
            <div className="flex justify-center px-2">
              <div
                className={`${sizeMap[data.textSize || "base"]} ${fontMap[data.textFont || "sans"]} ${alignMap[data.textAlign || "left"]} whitespace-pre-wrap max-w-full text-center`}
                style={{ color: data.textColor || "#000000" }}
              >
                {data.textContent?.length ? (
                  data.textContent
                ) : (
                  <span className="text-muted-foreground italic">No text</span>
                )}
              </div>
            </div>
            {/* Actions row moved below viewer */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Edit3 className="h-4 w-4 mr-2" /> Edit
              </Button>
              <span
                className={`text-xs px-2 py-1 rounded-full ${data.isEnabled ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground"}`}
              >
                {data.isEnabled ? "Active" : "Disabled"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default BlockForText;
