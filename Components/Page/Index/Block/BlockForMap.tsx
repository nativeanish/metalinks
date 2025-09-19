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
  MapPin,
  Navigation,
  Copy,
  ExternalLink,
} from "lucide-react";
import useBlock, { type BlockData } from "../../../../store/useBlock";
import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "sonner";

// Fix for default markers in react-leaflet
interface IconDefaultPrototype {
  _getIconUrl?: unknown;
}
delete (L.Icon.Default.prototype as IconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapData {
  latitude: number;
  longitude: number;
  zoom: number;
  title: string;
  description: string;
}

// Component for handling map clicks
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component for handling map zoom changes
function MapZoomHandler({
  onZoomChange,
}: {
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}

function BlockForMap({ data }: { data: BlockData }) {
  const updateBlockData = useBlock((s) => s.updateBlocks);
  const removeBlock = useBlock((s) => s.removeBlock);
  const [isEditing, setIsEditing] = useState(false);
  const [mapTitle, setMapTitle] = useState(data.title || "");
  const [description, setDescription] = useState(data.customDescription || "");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [mapData, setMapData] = useState<MapData>(() => {
    // Try to parse existing URL for coordinates
    if (data.url) {
      const match = data.url.match(/lat=([^&]+)&lng=([^&]+)&zoom=([^&]+)/);
      if (match) {
        return {
          latitude: parseFloat(match[1]),
          longitude: parseFloat(match[2]),
          zoom: parseInt(match[3]),
          title: data.title || "",
          description: data.customDescription || "",
        };
      }
    }
    // Default to New York City
    return {
      latitude: 40.7128,
      longitude: -74.006,
      zoom: 13,
      title: "",
      description: "",
    };
  });

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.", {
        description: React.createElement(
          "div",
          null,
          "Please use a compatible browser or select your location manually on the map."
        ),
      });
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          zoom: 15,
        }));
        setIsDetectingLocation(false);
      },
      (error) => {
        console.error("Error detecting location:", error);
        toast.error("Unable to retrieve your location.", {
          description: React.createElement(
            "div",
            null,
            "Please ensure location services are enabled and try again, or select your location manually on the map."
          ),
        });
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    setMapData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleZoomChange = (zoom: number) => {
    setMapData((prev) => ({
      ...prev,
      zoom: zoom,
    }));
  };

  const save = () => {
    const mapUrl = `https://www.openstreetmap.org/?mlat=${mapData.latitude}&mlon=${mapData.longitude}&zoom=${mapData.zoom}#map=${mapData.zoom}/${mapData.latitude}/${mapData.longitude}`;

    updateBlockData({
      id: data.id,
      title: mapTitle,
      customDescription: description,
      url: mapUrl,
      // Store coordinates in a custom format for internal use
      urls: [
        `lat=${mapData.latitude}&lng=${mapData.longitude}&zoom=${mapData.zoom}`,
      ],
    });
    setIsEditing(false);
  };

  const copyCoordinates = () => {
    const coords = `${mapData.latitude.toFixed(6)}, ${mapData.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(coords);
  };

  const openInMaps = () => {
    const url = `https://www.openstreetmap.org/?mlat=${mapData.latitude}&mlon=${mapData.longitude}&zoom=${mapData.zoom}#map=${mapData.zoom}/${mapData.latitude}/${mapData.longitude}`;
    window.open(url, "_blank");
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
                Interactive map with location pinning
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                <span>
                  {mapData.latitude && mapData.longitude
                    ? "Located"
                    : "No location"}
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
                <Label htmlFor={`map-title-${data.id}`}>Location Title</Label>
                <Input
                  id={`map-title-${data.id}`}
                  placeholder="Enter location name"
                  value={mapTitle}
                  onChange={(e) => setMapTitle(e.target.value)}
                  className="bg-muted/40"
                />
              </div>
              <div className="space-y-2">
                <Label>Quick Actions</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={detectCurrentLocation}
                    disabled={isDetectingLocation}
                    className="flex-1"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    {isDetectingLocation ? "Detecting..." : "My Location"}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`map-desc-${data.id}`}>Description</Label>
              <Textarea
                id={`map-desc-${data.id}`}
                placeholder="Describe this location..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-20 bg-muted/40"
              />
            </div>

            {/* Coordinates Display */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-muted/30 rounded-lg">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Latitude
                </Label>
                <p className="text-sm font-mono">
                  {mapData.latitude.toFixed(6)}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Longitude
                </Label>
                <p className="text-sm font-mono">
                  {mapData.longitude.toFixed(6)}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Zoom</Label>
                <p className="text-sm font-mono">{mapData.zoom}</p>
              </div>
            </div>

            {/* Interactive Map */}
            <div className="space-y-2">
              <Label>Interactive Map</Label>
              <p className="text-xs text-muted-foreground">
                Click anywhere on the map to set your location pin
              </p>
              <div className="h-64 w-full rounded-lg overflow-hidden border border-border">
                <MapContainer
                  center={[mapData.latitude, mapData.longitude]}
                  zoom={mapData.zoom}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler onLocationSelect={handleMapClick} />
                  <MapZoomHandler onZoomChange={handleZoomChange} />
                  <Marker position={[mapData.latitude, mapData.longitude]}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-medium">
                          {mapTitle || "Selected Location"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {mapData.latitude.toFixed(6)},{" "}
                          {mapData.longitude.toFixed(6)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
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
                Save Location
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Location Info */}
            {mapTitle && (
              <div>
                <p className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {mapTitle}
                </p>
              </div>
            )}

            {description && (
              <p className="text-xs text-muted-foreground whitespace-pre-line">
                {description}
              </p>
            )}

            {/* Map Preview */}
            <div className="h-48 w-full rounded-lg overflow-hidden border border-border bg-muted/30">
              {mapData.latitude && mapData.longitude ? (
                <MapContainer
                  center={[mapData.latitude, mapData.longitude]}
                  zoom={mapData.zoom}
                  style={{ height: "100%", width: "100%" }}
                  className="z-0"
                  zoomControl={false}
                  dragging={false}
                  touchZoom={false}
                  doubleClickZoom={false}
                  scrollWheelZoom={false}
                  boxZoom={false}
                  keyboard={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[mapData.latitude, mapData.longitude]}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-medium">{mapTitle || "Location"}</p>
                        <p className="text-xs text-muted-foreground">
                          {mapData.latitude.toFixed(6)},{" "}
                          {mapData.longitude.toFixed(6)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No location set
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Coordinates Display */}
            {mapData.latitude && mapData.longitude && (
              <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground font-mono">
                      {mapData.latitude.toFixed(6)},{" "}
                      {mapData.longitude.toFixed(6)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={copyCoordinates}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={openInMaps}
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
                {mapData.latitude && mapData.longitude && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const shareData = {
                        title: mapTitle || "Location",
                        url: `https://www.openstreetmap.org/?mlat=${mapData.latitude}&mlon=${mapData.longitude}&zoom=${mapData.zoom}`,
                      };
                      if (navigator.share) {
                        navigator.share(shareData);
                      } else {
                        navigator.clipboard.writeText(shareData.url);
                      }
                    }}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
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

export default BlockForMap;
