import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AvailabilityConfig,
  TimeSlot,
  defaultAvailabilityConfig,
  loadAvailabilityConfig,
  saveAvailabilityConfig,
} from "@/lib/availability";

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
    <div className="bg-white border border-gray-100 rounded-3xl p-6 mb-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <p className="text-lg font-semibold text-gray-900">{t("admin_avail_title")}</p>
          <p className="text-sm text-gray-500 max-w-2xl mt-1">
            {t("admin_avail_subtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center justify-center rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white hover:bg-coral-600 transition-all"
        >
          {t("admin_avail_save")}
        </button>
      </div>

      {!canSyncServer && (
        <div className="mb-4 rounded-2xl border px-4 py-3 text-sm text-yellow-700 bg-yellow-50 border-yellow-200">
          {adminSecret
            ? t("admin_avail_no_url")
            : t("admin_avail_no_auth")}
        </div>
      )}

      {(saveMessage || saveError) && (
        <div className="mb-4 rounded-2xl border px-4 py-3 text-sm text-gray-700 bg-gray-50 border-gray-200">
          {saveError ? <span className="text-red-600">{saveError}</span> : <span>{saveMessage}</span>}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Weekday Selection */}
          <div className="rounded-2xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">{t("admin_avail_select_day")}</p>
            <div className="grid grid-cols-7 gap-2">
              {weekdayLabels.map((label, index) => {
                const hasCustomSlots = config.availableTimeSlotsByWeekday[index] !== undefined;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSelectedWeekday(index)}
                    className={`rounded-2xl px-3 py-2 text-sm font-medium transition-all ${
                      selectedWeekday === index
                        ? "bg-coral text-white"
                        : hasCustomSlots
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {t("admin_avail_hint_blue")}
            </p>
          </div>

          {/* Time Slot Customization */}
          <div className="rounded-2xl border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">{t("admin_avail_custom_slots_for")} {weekdayLabels[selectedWeekday]}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {t("admin_avail_custom_slots_hint")}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetWeekdaySlots}
                className="rounded-2xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-all"
              >
                {t("admin_avail_reset_default")}
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap mb-4">
              <input
                type="text"
                placeholder={t("admin_avail_slot_placeholder")}
                value={weekdaySlotInput}
                onChange={(e) => {
                  setWeekdaySlotInput(e.target.value);
                  setInputError("");
                }}
                className="min-w-[200px] flex-1 rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-coral"
              />
              <button
                type="button"
                onClick={handleAddWeekdayTimeSlot}
                className="rounded-2xl bg-coral px-4 py-2 text-sm font-semibold text-white hover:bg-coral-600 transition-all"
              >
                {t("admin_avail_add_slot")}
              </button>
            </div>
            {inputError && (
              <p className="text-sm text-red-600 mb-4">{inputError}</p>
            )}

            <div className="space-y-2 mb-4">
              {selectedWeekdaySlots.length > 0 ? (
                selectedWeekdaySlots.map((slot, index) => (
                  <div key={`${slot.start}-${slot.end}-${index}`} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <div className="flex items-center gap-2 flex-1">
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
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-coral"
                        placeholder="HH:MM-HH:MM"
                      />
                      <span className={`text-sm font-medium ${slot.available ? 'text-green-700' : 'text-red-700'}`}>
                        {slot.available ? `(${t("admin_avail_available")})` : `(${t("admin_avail_blocked")})`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
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
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                          slot.available
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
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
                        className="px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                      >
                        {t("admin_avail_remove_btn")}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  {t("admin_avail_no_slots")} {weekdayLabels[selectedWeekday]}. {t("admin_avail_add_hint")}
                </p>
              )}
            </div>

            <p className="text-xs text-gray-500">
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

        <div className="rounded-2xl border border-gray-200 p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">{t("admin_avail_blocked_dates")}</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={blockedDateInput}
                onChange={(e) => setBlockedDateInput(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-coral"
              />
              <button
                type="button"
                onClick={handleAddBlockedDate}
                className="rounded-2xl bg-coral px-4 py-2 text-sm font-semibold text-white hover:bg-coral-600 transition-all"
              >
                {t("admin_avail_add_btn")}
              </button>
            </div>
            {config.blockedDates.length > 0 ? (
              <div className="mt-4 grid gap-2">
                {config.blockedDates.map((date) => (
                  <div key={date} className="flex items-center justify-between rounded-2xl bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    <span>{date}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveBlockedDate(date)}
                      className="text-red-500 hover:text-red-600"
                    >
                      {t("admin_avail_remove_btn")}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 mt-3">{t("admin_avail_no_blocked")}</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
            <p className="font-semibold text-gray-800 mb-2">{t("admin_avail_behavior_title")}</p>
            <p>{t("admin_avail_behavior_desc")}</p>
            <p className="mt-2">{t("admin_avail_storage_desc")}</p>
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
