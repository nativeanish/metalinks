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
  Edit3,
  Save,
  BarChart3,
  Mail,
  Copy,
  ExternalLink,
} from "lucide-react";
import useBlock, { type BlockData } from "../../../../store/useBlock";
import { useState } from "react";

interface NewsletterData {
  title: string;
  description: string;
  emailPlaceholder: string;
  subscribeUrl: string;
}

function BlockForNewsLetter({ data }: { data: BlockData }) {
  const updateBlockData = useBlock((s) => s.updateBlocks);
  const removeBlock = useBlock((s) => s.removeBlock);
  const [isEditing, setIsEditing] = useState(false);

  const [newsletterData, setNewsletterData] = useState<NewsletterData>(() => {
    // Try to parse existing data from URLs or initialize empty
    try {
      if (data.urls && data.urls.length > 0) {
        return JSON.parse(data.urls[0]);
      }
    } catch {
      // ignore parsing errors
    }

    return {
      title: data.title || "Subscribe to my Newsletter",
      description:
        data.customDescription ||
        "Get the latest updates delivered to your inbox",
      emailPlaceholder: "Enter your email address",
      subscribeUrl: data.url || "",
    };
  });

  const save = () => {
    // Store newsletter data as JSON in urls array
    const serializedData = JSON.stringify(newsletterData);

    updateBlockData({
      id: data.id,
      title: newsletterData.title,
      customDescription: newsletterData.description,
      url: newsletterData.subscribeUrl,
      urls: [serializedData],
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
                Newsletter subscription form
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                <span>Newsletter</span>
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
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`newsletter-title-${data.id}`}>
                  Newsletter Title
                </Label>
                <Input
                  id={`newsletter-title-${data.id}`}
                  placeholder="Enter newsletter title"
                  value={newsletterData.title}
                  onChange={(e) =>
                    setNewsletterData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="bg-muted/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`newsletter-desc-${data.id}`}>
                  Description
                </Label>
                <Textarea
                  id={`newsletter-desc-${data.id}`}
                  placeholder="Describe your newsletter..."
                  value={newsletterData.description}
                  onChange={(e) =>
                    setNewsletterData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="min-h-20 bg-muted/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`email-placeholder-${data.id}`}>
                  Email Placeholder Text
                </Label>
                <Input
                  id={`email-placeholder-${data.id}`}
                  placeholder="Enter placeholder text for email field"
                  value={newsletterData.emailPlaceholder}
                  onChange={(e) =>
                    setNewsletterData((prev) => ({
                      ...prev,
                      emailPlaceholder: e.target.value,
                    }))
                  }
                  className="bg-muted/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`subscribe-url-${data.id}`}>
                  Subscribe URL
                </Label>
                <Input
                  id={`subscribe-url-${data.id}`}
                  placeholder="Enter the URL where users will subscribe"
                  value={newsletterData.subscribeUrl}
                  onChange={(e) =>
                    setNewsletterData((prev) => ({
                      ...prev,
                      subscribeUrl: e.target.value,
                    }))
                  }
                  className="bg-muted/40"
                />
                <p className="text-xs text-muted-foreground">
                  This is where users will be redirected when they click
                  subscribe
                </p>
              </div>
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
                Save Newsletter
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Newsletter Preview */}
            <div className="p-6 rounded-lg border bg-muted/20">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Mail className="h-6 w-6 text-primary" />
                  <h3 className="text-lg font-semibold">
                    {newsletterData.title}
                  </h3>
                </div>

                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {newsletterData.description}
                </p>

                {/* Mock Form */}
                <div className="space-y-3 max-w-sm mx-auto">
                  <input
                    type="email"
                    placeholder={newsletterData.emailPlaceholder}
                    disabled
                    className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                  />

                  <Button
                    disabled
                    className="w-full bg-primary text-primary-foreground"
                  >
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>

            {/* Subscribe URL Display */}
            {newsletterData.subscribeUrl && (
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground truncate">
                      {newsletterData.subscribeUrl}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() =>
                        navigator.clipboard.writeText(
                          newsletterData.subscribeUrl
                        )
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
                  onClick={() =>
                    window.open(newsletterData.subscribeUrl, "_blank")
                  }
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
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                {newsletterData.subscribeUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const shareData = {
                        title: newsletterData.title,
                        text: `${newsletterData.description}\n\nSubscribe: ${newsletterData.subscribeUrl}`,
                        url: newsletterData.subscribeUrl,
                      };
                      if (navigator.share) {
                        navigator.share(shareData);
                      } else {
                        navigator.clipboard.writeText(
                          `${newsletterData.title}\n\n${newsletterData.description}\n\nSubscribe: ${newsletterData.subscribeUrl}`
                        );
                      }
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
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

export default BlockForNewsLetter;
