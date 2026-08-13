import { format, parseISO } from "date-fns";

export function extractMeetingCode(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    const parts = url.pathname.split("/");
    const lastPart = parts[parts.length - 1];
    if (/^\d{3}-\d{3}-\d{3}$/.test(lastPart)) {
      return lastPart;
    }
  } catch {
    // Not a valid URL
  }
  return trimmed;
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "";
  try {
    return format(parseISO(dateString), "MMM dd, yyyy");
  } catch {
    return dateString;
  }
}

export function formatTime(dateString: string | null): string {
  if (!dateString) return "";
  try {
    return format(parseISO(dateString), "h:mm a");
  } catch {
    return dateString;
  }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  if (remainingMins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMins} min`;
}
