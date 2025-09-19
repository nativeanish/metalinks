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
  Edit3,
  Save,
  BarChart3,
  Calendar,
  Clock,
  Globe,
  Plus,
  X,
} from "lucide-react";
import useBlock, { type BlockData } from "../../../../store/useBlock";
import { useState, useEffect } from "react";

interface ScheduleSlot {
  id: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  title: string;
  // Per-day overrides generated between startDate and endDate (inclusive)
  days?: DayAvailability[];
}

interface DayAvailability {
  date: string; // YYYY-MM-DD
  enabled: boolean; // whether this day is active
  startTime: string; // per-day start time
  endTime: string; // per-day end time
}

interface CalendarData {
  title: string;
  description: string;
  schedules: ScheduleSlot[];
  defaultTimezone: string;
}

// Common timezones for the select dropdown
const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
];

function BlockForCalendar({ data }: { data: BlockData }) {
  const updateBlockData = useBlock((s) => s.updateBlocks);
  const removeBlock = useBlock((s) => s.removeBlock);
  const [isEditing, setIsEditing] = useState(false);

  const [calendarData, setCalendarData] = useState<CalendarData>(() => {
    // Try to parse existing data from URLs or initialize empty
    try {
      if (data.urls && data.urls.length > 0) {
        const parsed = JSON.parse(data.urls[0]);
        // Backfill any missing per-day data for legacy schedules
        if (parsed?.schedules) {
          parsed.schedules = parsed.schedules.map((s: ScheduleSlot) => {
            if (!s.days && s.startDate) {
              return {
                ...s,
                days: generateDaysArray(
                  s.startDate,
                  s.endDate || s.startDate,
                  s.startTime,
                  s.endTime
                ),
              };
            }
            return s;
          });
        }
        return parsed;
      }
    } catch {
      // ignore parsing errors
    }

    return {
      title: data.title || "",
      description: data.customDescription || "",
      schedules: [],
      defaultTimezone:
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    };
  });

  // Auto-detect user's timezone on mount
  useEffect(() => {
    const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (userTimezone && calendarData.schedules.length === 0) {
      setCalendarData((prev) => ({
        ...prev,
        defaultTimezone: userTimezone,
      }));
    }
  }, [calendarData.schedules.length]);

  const addScheduleSlot = () => {
    const newSlot: ScheduleSlot = {
      id: `slot-${Date.now()}`,
      startDate: "",
      endDate: "",
      startTime: "09:00",
      endTime: "17:00",
      timezone: calendarData.defaultTimezone,
      title: "",
      days: [],
    };

    setCalendarData((prev) => ({
      ...prev,
      schedules: [...prev.schedules, newSlot],
    }));
  };

  const removeScheduleSlot = (id: string) => {
    setCalendarData((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((s) => s.id !== id),
    }));
  };

  const updateScheduleSlot = (id: string, updates: Partial<ScheduleSlot>) => {
    setCalendarData((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  };

  // Utility: generate days array between two dates inclusive
  const generateDaysArray = (
    start: string,
    end: string,
    startTime: string,
    endTime: string
  ): DayAvailability[] => {
    if (!start) return [];
    const result: DayAvailability[] = [];
    const startDate = new Date(start + "T00:00:00Z");
    const endDate = new Date((end || start) + "T00:00:00Z");
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return [];
    for (
      let d = new Date(startDate.getTime());
      d.getTime() <= endDate.getTime();
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      const iso = d.toISOString().slice(0, 10);
      result.push({
        date: iso,
        enabled: true,
        startTime,
        endTime,
      });
    }
    return result;
  };

  // Rebuild per-day list for a slot, preserving existing overrides
  const regenerateDaysForSlot = (slot: ScheduleSlot): ScheduleSlot => {
    if (!slot.startDate) return { ...slot, days: [] };
    const base = generateDaysArray(
      slot.startDate,
      slot.endDate || slot.startDate,
      slot.startTime,
      slot.endTime
    );
    if (!slot.days?.length) return { ...slot, days: base };
    // Preserve customizations
    const map = new Map(slot.days.map((d) => [d.date, d] as const));
    const merged = base.map((d) => ({ ...d, ...(map.get(d.date) || {}) }));
    return { ...slot, days: merged };
  };

  // When date or slot-level time changes, update both slot & its day overrides accordingly
  const updateSlotWithRegen = (
    id: string,
    updates: Partial<ScheduleSlot>,
    regenDates: boolean = false,
    propagateTimes: boolean = false
  ) => {
    setCalendarData((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) => {
        if (s.id !== id) return s;
        let updated: ScheduleSlot = { ...s, ...updates };
        if (regenDates) {
          updated = regenerateDaysForSlot(updated);
        }
        if (propagateTimes && updated.days) {
          updated.days = updated.days.map((d) => ({
            ...d,
            startTime: updates.startTime ?? d.startTime,
            endTime: updates.endTime ?? d.endTime,
          }));
        }
        return updated;
      }),
    }));
  };

  const updateDayInSlot = (
    slotId: string,
    date: string,
    updates: Partial<DayAvailability>
  ) => {
    setCalendarData((prev) => ({
      ...prev,
      schedules: prev.schedules.map((s) => {
        if (s.id !== slotId) return s;
        if (!s.days) return s;
        return {
          ...s,
          days: s.days.map((d) => (d.date === date ? { ...d, ...updates } : d)),
        };
      }),
    }));
  };

  const save = () => {
    // Store calendar data as JSON in urls array
    const serializedData = JSON.stringify(calendarData);

    updateBlockData({
      id: data.id,
      title: calendarData.title,
      customDescription: calendarData.description,
      urls: [serializedData],
      url: `calendar://${calendarData.schedules.length}-schedules`,
    });
    setIsEditing(false);
  };

  const formatScheduleDisplay = (schedule: ScheduleSlot) => {
    if (!schedule.startDate) return "No date set";

    const startDate = new Date(schedule.startDate);
    const endDate = schedule.endDate ? new Date(schedule.endDate) : startDate;

    const dateStr =
      schedule.startDate === schedule.endDate || !schedule.endDate
        ? startDate.toLocaleDateString()
        : `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

    const timeStr = `${schedule.startTime} - ${schedule.endTime}`;
    const timezoneShort =
      schedule.timezone.split("/").pop()?.replace("_", " ") ||
      schedule.timezone;
    // If per-day overrides exist and any deviation or disabled day present, summarize
    if (schedule.days && schedule.days.length > 0) {
      const active = schedule.days.filter((d) => d.enabled);
      const varied = schedule.days.some(
        (d) =>
          d.startTime !== schedule.startTime || d.endTime !== schedule.endTime
      );
      if (varied || active.length !== schedule.days.length) {
        return `${active.length}/${schedule.days.length} days • ${timeStr} (${timezoneShort})`;
      }
    }
    return `${dateStr} • ${timeStr} (${timezoneShort})`;
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
                Schedule availability and time slots
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                <span>
                  {calendarData.schedules.length} schedule
                  {calendarData.schedules.length === 1 ? "" : "s"}
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
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`calendar-title-${data.id}`}>
                  Calendar Title
                </Label>
                <Input
                  id={`calendar-title-${data.id}`}
                  placeholder="Enter calendar title"
                  value={calendarData.title}
                  onChange={(e) =>
                    setCalendarData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className="bg-muted/40"
                />
              </div>
              <div className="space-y-2">
                <Label>Default Timezone</Label>
                <Select
                  value={calendarData.defaultTimezone}
                  onValueChange={(value) =>
                    setCalendarData((prev) => ({
                      ...prev,
                      defaultTimezone: value,
                    }))
                  }
                >
                  <SelectTrigger className="bg-muted/40">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`calendar-desc-${data.id}`}>Description</Label>
              <Textarea
                id={`calendar-desc-${data.id}`}
                placeholder="Describe your availability or calendar purpose..."
                value={calendarData.description}
                onChange={(e) =>
                  setCalendarData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="min-h-20 bg-muted/40"
              />
            </div>

            {/* Schedule Slots */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Schedule Slots</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addScheduleSlot}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slot
                </Button>
              </div>

              {calendarData.schedules.length === 0 ? (
                <div className="p-6 border border-dashed border-border rounded-lg text-center">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No schedule slots added yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add your first availability slot above
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {calendarData.schedules.map((schedule, index) => (
                    <div
                      key={schedule.id}
                      className="p-4 border border-border rounded-lg bg-muted/20 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                            Slot {index + 1}
                          </span>
                          {schedule.title && (
                            <span className="text-sm font-medium">
                              {schedule.title}
                            </span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => removeScheduleSlot(schedule.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">
                            Slot Title (Optional)
                          </Label>
                          <Input
                            placeholder="e.g., Morning Session"
                            value={schedule.title}
                            onChange={(e) =>
                              updateScheduleSlot(schedule.id, {
                                title: e.target.value,
                              })
                            }
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Timezone</Label>
                          <Select
                            value={schedule.timezone}
                            onValueChange={(value) =>
                              updateScheduleSlot(schedule.id, {
                                timezone: value,
                              })
                            }
                          >
                            <SelectTrigger
                              size="sm"
                              className="bg-background/50"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIMEZONES.map((tz) => (
                                <SelectItem key={tz.value} value={tz.value}>
                                  {tz.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Start Date
                          </Label>
                          <Input
                            type="date"
                            value={schedule.startDate}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateSlotWithRegen(
                                schedule.id,
                                {
                                  startDate: value,
                                  endDate: schedule.endDate || value,
                                },
                                true
                              );
                            }}
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            End Date
                          </Label>
                          <Input
                            type="date"
                            value={schedule.endDate}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateSlotWithRegen(
                                schedule.id,
                                { endDate: value },
                                true
                              );
                            }}
                            className="bg-background/50"
                            min={schedule.startDate}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Start Time
                          </Label>
                          <Input
                            type="time"
                            value={schedule.startTime}
                            onChange={(e) =>
                              updateSlotWithRegen(
                                schedule.id,
                                { startTime: e.target.value },
                                false,
                                true
                              )
                            }
                            className="bg-background/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            End Time
                          </Label>
                          <Input
                            type="time"
                            value={schedule.endTime}
                            onChange={(e) =>
                              updateSlotWithRegen(
                                schedule.id,
                                { endTime: e.target.value },
                                false,
                                true
                              )
                            }
                            className="bg-background/50"
                            min={schedule.startTime}
                          />
                        </div>
                      </div>

                      {/* Per-day management */}
                      {schedule.startDate && (
                        <div className="space-y-3">
                          <Label className="text-xs font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Day-by-day
                            availability
                          </Label>
                          {(!schedule.days || schedule.days.length === 0) && (
                            <div className="text-xs text-muted-foreground">
                              Select a start & end date to generate days.
                            </div>
                          )}
                          {schedule.days && schedule.days.length > 0 && (
                            <div className="max-h-60 overflow-y-auto rounded border border-border/60 divide-y divide-border/50 bg-background/40">
                              {schedule.days.map((d) => {
                                const weekday = new Date(
                                  d.date + "T00:00:00"
                                ).toLocaleDateString(undefined, {
                                  weekday: "short",
                                });
                                return (
                                  <div
                                    key={d.date}
                                    className={`flex items-center gap-2 px-2 py-2 text-xs ${!d.enabled ? "opacity-50" : ""}`}
                                  >
                                    <input
                                      type="checkbox"
                                      className="h-3 w-3 accent-primary"
                                      checked={d.enabled}
                                      onChange={(e) =>
                                        updateDayInSlot(schedule.id, d.date, {
                                          enabled: e.target.checked,
                                        })
                                      }
                                    />
                                    <span className="w-28 font-medium">
                                      {weekday} {d.date}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Input
                                        type="time"
                                        value={d.startTime}
                                        onChange={(e) =>
                                          updateDayInSlot(schedule.id, d.date, {
                                            startTime: e.target.value,
                                          })
                                        }
                                        className="h-7 w-24 bg-background/50"
                                        disabled={!d.enabled}
                                      />
                                      <span>–</span>
                                      <Input
                                        type="time"
                                        value={d.endTime}
                                        min={d.startTime}
                                        onChange={(e) =>
                                          updateDayInSlot(schedule.id, d.date, {
                                            endTime: e.target.value,
                                          })
                                        }
                                        className="h-7 w-24 bg-background/50"
                                        disabled={!d.enabled}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {schedule.days && schedule.days.length > 0 && (
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
                              <span>
                                {schedule.days.filter((d) => d.enabled).length}{" "}
                                active day(s) of {schedule.days.length}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateSlotWithRegen(schedule.id, {}, true)
                                }
                                className="underline hover:text-primary"
                              >
                                Regenerate days
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
                disabled={calendarData.schedules.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Calendar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Calendar Title */}
            {calendarData.title && (
              <div>
                <p className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {calendarData.title}
                </p>
              </div>
            )}

            {/* Description */}
            {calendarData.description && (
              <p className="text-xs text-muted-foreground whitespace-pre-line">
                {calendarData.description}
              </p>
            )}

            {/* Schedule Display */}
            <div className="space-y-3">
              {calendarData.schedules.length === 0 ? (
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <Calendar className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No schedules configured
                  </p>
                </div>
              ) : (
                calendarData.schedules.map((schedule, index) => (
                  <div
                    key={schedule.id}
                    className="p-3 bg-muted/30 rounded-lg space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-primary/10 text-primary font-medium">
                          {index + 1}
                        </span>
                        {schedule.title && (
                          <span className="text-sm font-medium">
                            {schedule.title}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {schedule.timezone
                            .split("/")
                            .pop()
                            ?.replace("_", " ") || schedule.timezone}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {formatScheduleDisplay(schedule)}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary Info */}
            {calendarData.schedules.length > 0 && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 text-xs text-primary">
                  <Calendar className="h-3 w-3" />
                  <span className="font-medium">
                    {calendarData.schedules.length} availability slot
                    {calendarData.schedules.length === 1 ? "" : "s"} configured
                  </span>
                </div>
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
                {calendarData.schedules.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const shareText = `${calendarData.title || "Calendar"}\n\nAvailable times:\n${calendarData.schedules.map((s, i) => `${i + 1}. ${formatScheduleDisplay(s)}`).join("\n")}`;
                      if (navigator.share) {
                        navigator.share({
                          title: calendarData.title || "Calendar",
                          text: shareText,
                        });
                      } else {
                        navigator.clipboard.writeText(shareText);
                      }
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
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

export default BlockForCalendar;
