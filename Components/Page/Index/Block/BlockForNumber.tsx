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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../src/components/ui/select";
import { Trash2, Save, CreditCard as Edit3, Phone, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import useBlock, { type BlockData } from "../../../../store/useBlock";

interface CountryData {
  flags: {
    png: string;
    svg: string;
    alt?: string;
  };
  name: {
    common: string;
    official: string;
  };
  idd: {
    root: string;
    suffixes?: string[];
  };
}

interface NumberBlockData {
  title: string;
  description: string;
  countryCode: string;
  phoneNumber: string;
  selectedCountry?: CountryData;
}

function BlockForNumber({ data }: { data: BlockData }) {
  const [isEditingBlock, setEditingBlock] = useState<boolean>(false);
  const updateBlockData = useBlock((state) => state.updateBlocks);
  const removeBlock = useBlock((state) => state.removeBlock);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [blockData, setBlockData] = useState<NumberBlockData>(() => {
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
      countryCode: "",
      phoneNumber: "",
      selectedCountry: undefined,
    };
  });

  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://arweave.net/oXwiC2jv9AILJsnVpPoSH4X6rbhY-NJmP752vyd7W1Y"
        );
        const data = await response.json();
        setCountries(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const validatePhoneNumber = (value: string) => {
    if (!value) {
      setPhoneError("");
      return;
    }

    const phoneRegex = /^\d+$/;
    if (!phoneRegex.test(value)) {
      setPhoneError("Phone number must contain only digits");
    } else {
      setPhoneError("");
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    setBlockData((prev) => ({ ...prev, phoneNumber: value }));
    validatePhoneNumber(value);
  };

  const handleCountrySelect = (countryName: string) => {
    const country = countries.find((c) => c.name.common === countryName);
    if (country) {
      const code =
        country.idd.suffixes && country.idd.suffixes.length > 1
          ? country.idd.root
          : `${country.idd.root}${country.idd.suffixes?.[0] || ""}`;

      setBlockData((prev) => ({
        ...prev,
        countryCode: code,
        selectedCountry: country,
      }));
    }
  };

  const saveChanges = () => {
    if (phoneError || !blockData.phoneNumber || !blockData.countryCode) {
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

  const getFullPhoneNumber = () => {
    if (!blockData.countryCode || !blockData.phoneNumber) return "";
    return `${blockData.countryCode}${blockData.phoneNumber}`;
  };

  const copyPhoneNumber = () => {
    const fullNumber = getFullPhoneNumber();
    if (fullNumber) {
      navigator.clipboard.writeText(fullNumber);
    }
  };

  const filteredCountries = countries.filter((country) =>
    country.name.common.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                Phone Number Block
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
              <Label className="text-sm font-medium">Country</Label>
              {loading ? (
                <div className="text-sm text-muted-foreground">
                  Loading countries...
                </div>
              ) : (
                <Select
                  value={blockData.selectedCountry?.name.common || ""}
                  onValueChange={handleCountrySelect}
                >
                  <SelectTrigger className="bg-muted/40">
                    <SelectValue placeholder="Select country">
                      {blockData.selectedCountry && (
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://arweave.net/${blockData.selectedCountry.flags.svg}`}
                            alt={blockData.selectedCountry.name.common}
                            className="w-5 h-3 object-cover rounded"
                          />
                          <span>{blockData.selectedCountry.name.common}</span>
                          <span className="text-muted-foreground">
                            ({blockData.countryCode})
                          </span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5">
                      <Input
                        placeholder="Search country..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCountries.map((country) => {
                        const code =
                          country.idd.suffixes &&
                          country.idd.suffixes.length > 1
                            ? country.idd.root
                            : `${country.idd.root}${country.idd.suffixes?.[0] || ""}`;

                        return (
                          <SelectItem
                            key={country.name.common}
                            value={country.name.common}
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={`https://arweave.net/${country.flags.svg}`}
                                alt={country.name.common}
                                className="w-5 h-3 object-cover rounded"
                              />
                              <span>{country.name.common}</span>
                              <span className="text-muted-foreground">
                                ({code})
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </div>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor={`phone-${data.id}`}
                className="text-sm font-medium"
              >
                Phone Number
              </Label>
              <div className="flex gap-2">
                {blockData.countryCode && (
                  <div className="flex items-center px-3 bg-muted/40 border rounded-md min-w-fit">
                    <span className="text-sm font-medium">
                      {blockData.countryCode}
                    </span>
                  </div>
                )}
                <Input
                  id={`phone-${data.id}`}
                  placeholder="Enter phone number"
                  value={blockData.phoneNumber}
                  onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  className={`bg-muted/40 ${phoneError ? "border-red-500" : ""}`}
                />
              </div>
              {phoneError && (
                <p className="text-xs text-red-500">{phoneError}</p>
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
                disabled={
                  !!phoneError ||
                  !blockData.phoneNumber ||
                  !blockData.countryCode
                }
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

            {blockData.selectedCountry && blockData.phoneNumber ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <img
                    src={`https://arweave.net/${blockData.selectedCountry.flags.svg}`}
                    alt={blockData.selectedCountry.name.common}
                    className="w-8 h-5 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      {blockData.selectedCountry.name.common}
                    </p>
                    <p className="text-lg font-semibold">
                      {getFullPhoneNumber()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={copyPhoneNumber}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  className="w-full"
                  onClick={() =>
                    window.open(`tel:${getFullPhoneNumber()}`, "_self")
                  }
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </div>
            ) : (
              <div className="p-6 bg-muted/30 rounded-lg text-center">
                <Phone className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No phone number set
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

export default BlockForNumber;
