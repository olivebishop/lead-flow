import {
  format,
  isToday,
  isTomorrow,
  isPast,
  startOfDay,
} from "date-fns";

export type FollowupDisplay = {
  label: string;
  className: string;
};

export function formatFollowup(date: Date | string | null | undefined): FollowupDisplay | null {
  if (!date) return null;

  const d = typeof date === "string" ? new Date(date) : date;
  const today = startOfDay(new Date());
  const target = startOfDay(d);

  if (isPast(target) && !isToday(d)) {
    return {
      label: "⚠ Overdue",
      className: "text-destructive",
    };
  }
  if (isToday(d)) {
    return {
      label: "🔔 Today",
      className: "text-foreground",
    };
  }
  if (isTomorrow(d)) {
    return {
      label: "⏰ Tomorrow",
      className: "text-muted-foreground",
    };
  }
  return {
    label: `📅 ${format(d, "MMM dd")}`,
    className: "text-muted-foreground",
  };
}

export function formatValue(value: string | null | undefined): string | null {
  if (!value) return null;
  const num = parseFloat(value.replace(/[^0-9.]/g, ""));
  if (isNaN(num)) return value;
  return `KES ${num.toLocaleString("en-KE")}`;
}

export function toDateInputValue(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "yyyy-MM-dd");
}
