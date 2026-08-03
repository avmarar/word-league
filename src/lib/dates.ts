const DEFAULT_TIMEZONE =
  process.env.NEXT_PUBLIC_OFFICE_TIMEZONE ?? "Australia/Sydney";

export function getOfficeTimezone(): string {
  return DEFAULT_TIMEZONE;
}

export function getDateKey(timezone = getOfficeTimezone(), date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

export function getYesterdayDateKey(
  timezone = getOfficeTimezone(),
  date = new Date()
): string {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateKey(timezone, yesterday);
}

export function getWeekDateKeys(
  timezone = getOfficeTimezone(),
  date = new Date()
): string[] {
  const keys: string[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const day = new Date(date);
    day.setDate(day.getDate() - offset);
    keys.push(getDateKey(timezone, day));
  }
  return keys;
}

export function getMsUntilNextPuzzle(
  timezone = getOfficeTimezone(),
  now = new Date()
): number {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tomorrowKey = getDateKey(timezone, tomorrow);
  const [year, month, day] = tomorrowKey.split("-").map(Number);

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
  });
  const parts = formatter.formatToParts(now);
  const offsetPart = parts.find((part) => part.type === "timeZoneName");
  const offsetMatch = offsetPart?.value.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
  let offsetMinutes = 0;
  if (offsetMatch) {
    const hours = Number(offsetMatch[1]);
    const minutes = offsetMatch[2] ? Number(offsetMatch[2]) : 0;
    offsetMinutes = hours * 60 + Math.sign(hours) * minutes;
  }

  const midnightUtc = Date.UTC(year!, month! - 1, day!, 0, 0, 0);
  const midnightLocalAsUtc = midnightUtc - offsetMinutes * 60 * 1000;
  return Math.max(0, midnightLocalAsUtc - now.getTime());
}

export function formatCountdown(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
