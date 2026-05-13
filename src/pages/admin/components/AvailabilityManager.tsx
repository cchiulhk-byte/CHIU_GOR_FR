import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AvailabilityConfig,
  TimeSlot,
  defaultAvailabilityConfig,
  loadAvailabilityConfig,
  saveAvailabilityConfig,
} from "@/lib/availability";
import { Button } from "@/design-system/atoms/Button";
import { tokens } from "@/design-system/tokens";

function normalizeTimeSlot(value: string): { start: string; end: string } | null {
  const trimmed = value.trim();
  const parts = trimmed.split("-");
  if (parts.length === 1) {
    // Single time, assume 1 hour slot
    const start = normalizeTime(trimmed);
    if (!start) return null;
    const [hour, minute] = start.split(":").map(Number);
    const endHour = hour + 1;
    const end = `${endHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    return { start, end };
  } else if (parts.length === 2) {
    const start = normalizeTime(parts[0].trim());
    const end = normalizeTime(parts[1].trim());
    if (!start || !end) return null;
    return { start, end };
  }
  return null;
}

function normalizeTime(value: string) {
  const trimmed = value.trim();
  const parts = trimmed.split(":");
  if (parts.length !== 2) return "";
  const [hour, minute] = parts.map((part) => part.padStart(2, "0"));
  return `${hour}:${minute}`;
}

function isValidTime(value: string) {
  const normalized = normalizeTime(value);
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(normalized);
  return Boolean(match) ? normalized : "";
}

interface AvailabilityManagerProps {
  adminSecret?: string;
  onUnauthorized?: () => void;
}

export default function AvailabilityManager({ adminSecret, onUnauthorized }: AvailabilityManagerProps) {
  const { t } = useTranslation();
  const weekdayLabels = [
    t("admin_avail_day_sun"),
    t("admin_avail_day_mon"),
    t("admin_avail_day_tue"),
    t("admin_avail_day_wed"),
    t("admin_avail_day_thu"),
    t("admin_avail_day_fri"),
    t("admin_avail_day_sat"),
  ];

  const [config, setConfig] = useState<AvailabilityConfig>(defaultAvailabilityConfig);
  const [selectedWeekday, setSelectedWeekday] = useState<number>(1); // Start with Monday
  const [weekdaySlotInput, setWeekdaySlotInput] = useState("");
  const [blockedDateInput, setBlockedDateInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const localConfig = loadAvailabilityConfig();
    // Ensure all weekdays are enabled
    localConfig.enabledWeekdays = [0, 1, 2, 3, 4, 5, 6];
    setConfig(localConfig);

    const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
    if (!adminSecret || !supabaseUrl) {
      return;
    }

    const controller = new AbortController();
    fetch(`${supabaseUrl}/functions/v1/booking-manage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_availability" }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.availability) {
          setConfig(data.availability);
        }
      })
      .catch(() => {
        // ignore fetch failures, keep local config
      });

    return () => controller.abort();
  }, [adminSecret]);

  const selectedWeekdaySlots = config.availableTimeSlotsByWeekday[selectedWeekday] ?? [];
  const selectedWeekdayIsCustom = config.availableTimeSlotsByWeekday[selectedWeekday] !== undefined;

  const enabledWeekdaysText = useMemo(() => {
    const active = config.enabledWeekdays
      .slice()
      .sort((a, b) => a - b)
      .map((day) => weekdayLabels[day]);
    return active.join(", ");
  }, [config.enabledWeekdays]);

  const handleToggleWeekday = (dayIndex: number) => {
    setConfig((current) => {
      const enabled = current.enabledWeekdays.includes(dayIndex)
        ? current.enabledWeekdays.filter((day) => day !== dayIndex)
        : [...current.enabledWeekdays, dayIndex];
      return { ...current, enabledWeekdays: enabled };
    });
  };

  const handleAddWeekdayTimeSlot = () => {
    const normalized = normalizeTimeSlot(weekdaySlotInput);
    if (!normalized) {
      setInputError(t("admin_avail_error_format"));
      return;
    }
    setInputError("");
    setConfig((current) => {
      const currentSlots = current.availableTimeSlotsByWeekday[selectedWeekday] ?? [];
      const existingIndex = currentSlots.findIndex(s => s.start === normalized.start && s.end === normalized.end);
      if (existingIndex >= 0) {
        // Toggle available if exists
        const updatedSlots = currentSlots.map((s, i) =>
          i === existingIndex ? { ...s, available: !s.available } : s
        );
        return {
          ...current,
          availableTimeSlotsByWeekday: {
            ...current.availableTimeSlotsByWeekday,
            [selectedWeekday]: updatedSlots,
          },
        };
      } else {
        // Add new
        const updatedSlots = [...currentSlots, { ...normalized, available: true }];
        return {
          ...current,
          availableTimeSlotsByWeekday: {
            ...current.availableTimeSlotsByWeekday,
            [selectedWeekday]: updatedSlots,
          },
        };
      }
    });
    setWeekdaySlotInput("");
  };

  const handleResetWeekdaySlots = () => {
    setConfig((current) => {
      const next = { ...current.availableTimeSlotsByWeekday };
      delete next[selectedWeekday];
      return { ...current, availableTimeSlotsByWeekday: next };
    });
  };

  const handleAddBlockedDate = () => {
    if (!blockedDateInput) return;
    if (config.blockedDates.includes(blockedDateInput)) {
      setBlockedDateInput("");
      return;
    }
    setConfig((current) => ({
      ...current,
      blockedDates: [...current.blockedDates, blockedDateInput].sort(),
    }));
    setBlockedDateInput("");
  };

  const handleRemoveBlockedDate = (date: string) => {
    setConfig((current) => ({
      ...current,
      blockedDates: current.blockedDates.filter((item) => item !== date),
    }));
  };

  const handleSave = async () => {
    saveAvailabilityConfig(config);
    setSaveMessage(t("admin_avail_saved_local"));
    setSaveError("");

    const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
    if (adminSecret && supabaseUrl) {
      try {
        const res = await fetch(`${supabaseUrl}/functions/v1/booking-manage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "save_availability", admin_secret: adminSecret, config }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          if (res.status === 401) {
            onUnauthorized?.();
            throw new Error(t("admin_avail_no_auth"));
          }
          throw new Error(data?.error || `Server error: ${res.status}`);
        }
        setSaveMessage(t("admin_avail_saved_server"));
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : t("admin_avail_error_server"));
      }
    } else {
      setSaveMessage(t("admin_avail_saved_local_no_admin"));
    }

    window.setTimeout(() => {
      setSaveMessage("");
      setSaveError("");
    }, 4000);
  };

  const hasAllWeekdays = config.enabledWeekdays.length === 7;
  const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
  const canSyncServer = Boolean(adminSecret && supabaseUrl);

  return (
    <div className="bg-white dark:bg-[#1E0D38] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 mb-6 sm:mb-8 shadow-xl shadow-[#D4C8BC]/10 dark:shadow-[#000000]/20 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div>
          <p className="text-xl sm:text-2xl font-black text-[#1A1410] dark:text-[#E8E0F5] tracking-tight" style={{ fontFamily: tokens.typography.fontFamily }}>{t("admin_avail_title")}</p>
          <p className="text-xs sm:text-sm text-[#7A7068] dark:text-[#B89FD8] max-w-2xl mt-1 sm:mt-2 font-medium">
            {t("admin_avail_subtitle")}
          </p>
        </div>
        <Button
          onClick={handleSave}
          variant="primary"
          className="!px-6 sm:!px-8 !py-2.5 sm:!py-3 shadow-lg shadow-coral/20 w-full sm:w-auto"
        >
          {t("admin_avail_save")}
        </Button>
      </div>

      {!canSyncServer && (
        <div className="mb-6 rounded-2xl border px-4 py-3 text-sm text-yellow-700 dark:text-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700/50 font-bold">
          <i className="ri-alert-line mr-2"></i>
          {adminSecret
            ? t("admin_avail_no_url")
            : t("admin_avail_no_auth")}
        </div>
      )}

      {(saveMessage || saveError) && (
        <div className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-bold ${
          saveError 
            ? "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50" 
            : "text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-700/50"
        }`}>
          <i className={saveError ? "ri-error-warning-line mr-2" : "ri-checkbox-circle-line mr-2"}></i>
          {saveError ? saveError : saveMessage}
        </div>
      )}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Weekday Selection */}
          <div className="rounded-xl sm:rounded-[2rem] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 p-4 sm:p-6 bg-[#F7F4EF]/50 dark:bg-[#130A22]/50">
            <p className="text-xs font-black uppercase tracking-widest text-[#7A7068] dark:text-[#B89FD8] mb-4 ml-1">{t("admin_avail_select_day")}</p>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {weekdayLabels.map((label, index) => {
                const hasCustomSlots = config.availableTimeSlotsByWeekday[index] !== undefined;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSelectedWeekday(index)}
                    className={`rounded-2xl px-3 py-3 text-xs font-black transition-all ${
                      selectedWeekday === index
                        ? "bg-coral text-white shadow-lg shadow-coral/20"
                        : hasCustomSlots
                        ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20"
                        : "bg-white dark:bg-[#1E0D38] text-[#7A7068] dark:text-[#B89FD8] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 hover:border-coral/50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-bold text-[#7A7068]/60 dark:text-[#B89FD8]/60 mt-4 ml-1 italic">
              * {t("admin_avail_hint_blue")}
            </p>
          </div>

          {/* Time Slot Customization */}
          <div className="rounded-xl sm:rounded-[2rem] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <p className="text-sm font-black text-[#1A1410] dark:text-[#E8E0F5] uppercase tracking-wider break-words">{t("admin_avail_custom_slots_for")} {weekdayLabels[selectedWeekday]}</p>
                <p className="text-xs text-[#7A7068] dark:text-[#B89FD8] mt-1 font-medium break-words">
                  {t("admin_avail_custom_slots_hint")}
                </p>
              </div>
              <Button
                onClick={handleResetWeekdaySlots}
                variant="outline"
                className="!px-5 !py-2.5 !text-xs !rounded-full !bg-white/40 dark:!bg-[#2D1B4E]/40 w-full sm:w-auto flex-shrink-0"
              >
                {t("admin_avail_reset_default")}
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <input
                type="text"
                placeholder={t("admin_avail_slot_placeholder")}
                value={weekdaySlotInput}
                onChange={(e) => {
                  setWeekdaySlotInput(e.target.value);
                  setInputError("");
                }}
                className="w-full sm:flex-1 rounded-2xl border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 bg-[#F7F4EF] dark:bg-[#0E0818] px-4 py-3 text-sm text-[#1A1410] dark:text-[#E8E0F5] focus:outline-none focus:border-coral transition-all font-medium"
              />
              <Button
                onClick={handleAddWeekdayTimeSlot}
                variant="primary"
                className="!px-6 !py-3 shadow-lg shadow-coral/10 w-full sm:w-auto flex-shrink-0"
              >
                {t("admin_avail_add_slot")}
              </Button>
            </div>
            {inputError && (
              <p className="text-xs text-red-600 dark:text-red-400 mb-4 font-bold ml-1 flex items-center gap-2">
                <i className="ri-error-warning-line"></i>{inputError}
              </p>
            )}

            <div className="space-y-3 mb-6">
              {selectedWeekdaySlots.length > 0 ? (
                selectedWeekdaySlots.map((slot, index) => (
                  <div key={`${slot.start}-${slot.end}-${index}`} className="flex items-center justify-between rounded-2xl bg-white dark:bg-[#0E0818] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-2 h-2 rounded-full ${slot.available ? 'bg-teal-500 animate-pulse' : 'bg-red-500'}`}></div>
                      <input
                        type="text"
                        value={`${slot.start}-${slot.end}`}
                        onChange={(e) => {
                          const newRange = e.target.value;
                          const normalized = normalizeTimeSlot(newRange);
                          if (normalized) {
                            setConfig((current) => {
                              const currentSlots = current.availableTimeSlotsByWeekday[selectedWeekday] ?? [];
                              const updatedSlots = currentSlots.map((s, i) =>
                                i === index ? { ...normalized, available: s.available } : s
                              );
                              return {
                                ...current,
                                availableTimeSlotsByWeekday: {
                                  ...current.availableTimeSlotsByWeekday,
                                  [selectedWeekday]: updatedSlots,
                                },
                              };
                            });
                          }
                        }}
                        className="flex-1 px-2 py-1 text-sm bg-transparent text-[#1A1410] dark:text-[#E8E0F5] border-b border-transparent focus:border-coral focus:outline-none font-bold"
                        placeholder="HH:MM-HH:MM"
                      />
                      <span className={`text-xs font-black uppercase tracking-widest ${slot.available ? 'text-teal-600' : 'text-red-500'}`}>
                        {slot.available ? t("admin_avail_available") : t("admin_avail_blocked")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 ml-2 sm:ml-4 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setConfig((current) => {
                            const currentSlots = current.availableTimeSlotsByWeekday[selectedWeekday] ?? [];
                            const updatedSlots = currentSlots.map((s, i) =>
                              i === index ? { ...s, available: !s.available } : s
                            );
                            return {
                              ...current,
                              availableTimeSlotsByWeekday: {
                                ...current.availableTimeSlotsByWeekday,
                                [selectedWeekday]: updatedSlots,
                              },
                            };
                          });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          slot.available
                            ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                            : "bg-teal-500/10 text-teal-600 dark:text-teal-400 hover:bg-teal-500/20"
                        }`}
                      >
                        {slot.available ? t("admin_avail_block_btn") : t("admin_avail_unblock_btn")}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfig((current) => {
                            const currentSlots = current.availableTimeSlotsByWeekday[selectedWeekday] ?? [];
                            const updatedSlots = currentSlots.filter((_, i) => i !== index);
                            return {
                              ...current,
                              availableTimeSlotsByWeekday: {
                                ...current.availableTimeSlotsByWeekday,
                                [selectedWeekday]: updatedSlots,
                              },
                            };
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest bg-[#F7F4EF] dark:bg-[#1E0D38] text-[#7A7068] dark:text-[#B89FD8] hover:text-coral transition-all"
                      >
                        {t("admin_avail_remove_btn")}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-[#F7F4EF]/30 dark:bg-[#130A22]/30 rounded-2xl border border-dashed border-[#D4C8BC]/40 dark:border-[#3B2060]/40">
                  <i className="ri-calendar-event-line text-3xl text-[#D4C8BC] dark:text-[#3B2060] mb-3 block"></i>
                  <p className="text-sm text-[#7A7068] dark:text-[#B89FD8] font-medium px-4">
                    {t("admin_avail_no_slots")} {weekdayLabels[selectedWeekday]}.<br/>{t("admin_avail_add_hint")}
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs font-black uppercase tracking-widest text-[#7A7068]/60 dark:text-[#B89FD8]/60 ml-1">
              {selectedWeekdaySlots.length > 0
                ? t("admin_avail_slots_summary", {
                    available: selectedWeekdaySlots.filter((s) => s.available).length,
                    blocked: selectedWeekdaySlots.filter((s) => !s.available).length,
                    day: weekdayLabels[selectedWeekday],
                  })
                : t("admin_avail_no_slots_short", { day: weekdayLabels[selectedWeekday] })}
            </p>
          </div>
        </div>

        <div className="rounded-xl sm:rounded-[2rem] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[#7A7068] dark:text-[#B89FD8] mb-4 ml-1">{t("admin_avail_blocked_dates")}</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="date"
                value={blockedDateInput}
                onChange={(e) => setBlockedDateInput(e.target.value)}
                className="w-full sm:flex-1 rounded-2xl border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 bg-[#F7F4EF] dark:bg-[#0E0818] px-4 py-3 text-sm text-[#1A1410] dark:text-[#E8E0F5] focus:outline-none focus:border-coral transition-all font-medium"
              />
              <Button
                onClick={handleAddBlockedDate}
                variant="primary"
                className="!px-6 !py-3 shadow-lg shadow-coral/10 w-full sm:w-auto flex-shrink-0"
              >
                {t("admin_avail_add_btn")}
              </Button>
            </div>
            {config.blockedDates.length > 0 ? (
              <div className="mt-6 grid gap-2">
                {config.blockedDates.map((date) => (
                  <div key={date} className="flex items-center justify-between rounded-2xl bg-white dark:bg-[#0E0818] border border-[#D4C8BC]/40 dark:border-[#3B2060]/40 px-4 py-3 text-sm font-bold text-[#1A1410] dark:text-[#E8E0F5] shadow-sm">
                    <span>{date}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBlockedDate(date)}
                      className="text-red-500 hover:text-red-600 transition-colors p-1"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-bold text-[#7A7068]/60 dark:text-[#B89FD8]/60 mt-4 ml-1 italic">{t("admin_avail_no_blocked")}</p>
            )}
          </div>

          <div className="rounded-xl sm:rounded-[1.5rem] border border-[#D4C8BC]/20 dark:border-[#3B2060]/20 bg-[#F7F4EF]/50 dark:bg-[#130A22]/50 p-4 sm:p-6 text-sm text-[#7A7068] dark:text-[#B89FD8]">
            <p className="text-xs font-black uppercase tracking-widest text-[#1A1410] dark:text-[#E8E0F5] mb-3">{t("admin_avail_behavior_title")}</p>
            <p className="leading-relaxed font-medium">{t("admin_avail_behavior_desc")}</p>
            <p className="mt-3 leading-relaxed font-medium opacity-80">{t("admin_avail_storage_desc")}</p>
          </div>
        </div>
      </div>

      {saveMessage && (
        <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700">
          {saveMessage}
        </div>
      )}
    </div>
  );
}
