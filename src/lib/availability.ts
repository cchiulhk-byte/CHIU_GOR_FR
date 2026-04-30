import { timeSlots } from "@/mocks/booking";

const STORAGE_KEY = "availability-config";

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface AvailabilityConfig {
  enabledWeekdays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  availableTimeSlotsByWeekday: Record<number, TimeSlot[]>;
  blockedDates: string[]; // YYYY-MM-DD
}

export const defaultAvailabilityConfig: AvailabilityConfig = {
  enabledWeekdays: [0, 1, 2, 3, 4, 5, 6],
  availableTimeSlotsByWeekday: {},
  blockedDates: [],
};

export function loadAvailabilityConfig(): AvailabilityConfig {
  if (typeof window === "undefined") return defaultAvailabilityConfig;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAvailabilityConfig;
    const parsed = JSON.parse(raw) as AvailabilityConfig & {
      availableTimeSlots?: string[];
      defaultTimeSlots?: string[];
      availableTimeSlotsByWeekday?: Record<number, string[] | TimeSlot[]>;
    };
    if (Array.isArray(parsed.enabledWeekdays) && Array.isArray(parsed.blockedDates)) {
      let availableTimeSlotsByWeekday: Record<number, TimeSlot[]> = {};

      if (parsed.availableTimeSlotsByWeekday) {
        // Convert old string[] to TimeSlot[]
        for (const [key, slots] of Object.entries(parsed.availableTimeSlotsByWeekday)) {
          const weekday = parseInt(key);
          if (Array.isArray(slots)) {
            if (typeof slots[0] === 'string') {
              // Old format: string[]
              availableTimeSlotsByWeekday[weekday] = (slots as string[]).map(slot => ({
                start: slot,
                end: slot, // Assuming start and end are the same for now
                available: true,
              }));
            } else {
              // New format: TimeSlot[]
              availableTimeSlotsByWeekday[weekday] = slots as TimeSlot[];
            }
          }
        }
      }

      // Support legacy fallback data
      if (!Object.keys(availableTimeSlotsByWeekday).length) {
        const slots = Array.isArray(parsed.availableTimeSlots)
          ? parsed.availableTimeSlots
          : Array.isArray(parsed.defaultTimeSlots)
          ? parsed.defaultTimeSlots
          : [];
        if (slots.length) {
          availableTimeSlotsByWeekday = {
            1: slots.map(slot => ({ start: slot, end: slot, available: true })),
            2: slots.map(slot => ({ start: slot, end: slot, available: true })),
            3: slots.map(slot => ({ start: slot, end: slot, available: true })),
            4: slots.map(slot => ({ start: slot, end: slot, available: true })),
            5: slots.map(slot => ({ start: slot, end: slot, available: true })),
            6: slots.map(slot => ({ start: slot, end: slot, available: true })),
            0: slots.map(slot => ({ start: slot, end: slot, available: true })),
          };
        }
      }

      return {
        enabledWeekdays: parsed.enabledWeekdays,
        availableTimeSlotsByWeekday,
        blockedDates: parsed.blockedDates,
      };
    }
  } catch {
    // ignore invalid config
  }
  return defaultAvailabilityConfig;
}

export function saveAvailabilityConfig(config: AvailabilityConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function isDateBlocked(date: string, config: AvailabilityConfig) {
  return config.blockedDates.includes(date);
}

export function isWeekdayEnabled(date: string, config: AvailabilityConfig) {
  const weekday = new Date(date).getDay();
  return config.enabledWeekdays.includes(weekday);
}

export function getAvailableTimeSlotsForDate(date: string, config: AvailabilityConfig) {
  const weekday = new Date(date).getDay();
  const customSlots = config.availableTimeSlotsByWeekday[weekday];
  if (Array.isArray(customSlots) && customSlots.length) {
    return customSlots.filter(slot => slot.available);
  }
  // Fall back to default time slots if weekday is enabled but no custom slots configured
  if (config.enabledWeekdays.includes(weekday)) {
    return timeSlots.map(slot => ({ start: slot, end: slot, available: true }));
  }
  return [];
}
