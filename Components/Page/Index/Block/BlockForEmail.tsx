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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../../src/components/ui/tooltip";
import { Trash2, Save, CreditCard as Edit3, Mail, Copy } from "lucide-react";
import { useState } from "react";
import useBlock, { type BlockData } from "../../../../store/useBlock";

interface EmailBlockData {
  title: string;
  description: string;
  email: string;
}

function BlockForEmail({ data }: { data: BlockData }) {
  const [isEditingBlock, setEditingBlock] = useState<boolean>(false);
  const updateBlockData = useBlock((state) => state.updateBlocks);
  const removeBlock = useBlock((state) => state.removeBlock);

  const [blockData, setBlockData] = useState<EmailBlockData>(() => {
    try {
      if (data.urls && data.urls.length > 0) {
        return JSON.parse(data.urls[0]);
      }
    } catch {
      // ignore
    }

    return {
      title: data.title || "",
      description: data.customDescription || "",
      email: "",
    };
  });

  const [emailError, setEmailError] = useState("");

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleEmailChange = (value: string) => {
    setBlockData((prev) => ({ ...prev, email: value }));
    validateEmail(value);
  };

  const saveChanges = () => {
    if (emailError || !blockData.email) {
      return;
    }

    const serializedData = JSON.stringify(blockData);

    updateBlockData({
      id: data.id,
      title: blockData.title,
      customDescription: blockData.description,
      urls: [serializedData],
    });
    setEditingBlock(false);
  };

  const copyEmail = () => {
    if (blockData.email) {
      navigator.clipboard.writeText(blockData.email);
    }
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
                Email Address Block
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
      </CardHeader>

      <CardContent className="pt-0">
        {isEditingBlock ? (
          <div className="space-y-4">
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
                htmlFor={`description-${data.id}`}
                className="text-sm font-medium"
              >
                Description
              </Label>
              <Textarea
                id={`description-${data.id}`}
                placeholder="Enter description"
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

            <div className="space-y-2">
              <Label
                htmlFor={`email-${data.id}`}
                className="text-sm font-medium"
              >
                Email Address
              </Label>
              <Input
                id={`email-${data.id}`}
                type="email"
                placeholder="your.email@example.com"
                value={blockData.email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`bg-muted/40 ${emailError ? "border-red-500" : ""}`}
              />
              {emailError && (
                <p className="text-xs text-red-500">{emailError}</p>
              )}
            </div>

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
                disabled={!!emailError || !blockData.email}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {blockData.title && (
              <h3 className="text-sm font-medium">{blockData.title}</h3>
            )}

            {blockData.description && (
              <p className="text-sm text-muted-foreground">
                {blockData.description}
              </p>
            )}

            {blockData.email ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium break-all">
                      {blockData.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={copyEmail}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  className="w-full"
                  onClick={() =>
                    window.open(`mailto:${blockData.email}`, "_self")
                  }
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              </div>
            ) : (
              <div className="p-6 bg-muted/30 rounded-lg text-center">
                <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No email address set
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingBlock(true)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>

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
        )}
      </CardContent>
    </Card>
  );
}

export default BlockForEmail;
