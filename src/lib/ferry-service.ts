/**
 * Ferry schedule data service.
 * Replace `fetchFerryDepartures` body with a real REST call later, e.g.:
 *   const res = await fetch(`${API_BASE}/departures?route=${encodeURIComponent(route)}`);
 *   if (!res.ok) throw new Error("fetch failed");
 *   return (await res.json()) as FerryDeparture;
 * The UI only depends on the `FerryDeparture` shape below.
 */
export type CapacityStatus = "vapaa" | "tayttyy" | "taynna";
export type QueueLevel = "normaali" | "kohtalainen" | "ruuhka";

export interface FerryDeparture {
  vesselName: string;
  departureTime: string; // "HH:MM"
  delayMinutes: number;
  capacityStatus: CapacityStatus;
  queue: { level: QueueLevel; waitMinutes: number; reports: number };
}

export type QueueReport = "ei-jonoa" | "hieman" | "pitka";

const VESSELS = ["M/S Stella", "M/S Nestor", "M/S Prostvik 1", "M/S Mergus", "Lossi Nauvo II"];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchFerryDepartures(route: string, plannedTime: string): Promise<FerryDeparture> {
  await wait(900 + Math.random() * 700);
  if (Math.random() < 0.2) throw new Error("Schedule service unavailable");
  const h = hash(route + plannedTime);
  const level: QueueLevel = (["normaali", "kohtalainen", "ruuhka"] as const)[h % 3]!;
  return {
    vesselName: VESSELS[h % VESSELS.length]!,
    departureTime: /^\d{1,2}:\d{2}$/.test(plannedTime) ? plannedTime : "10:15",
    delayMinutes: h % 4 === 0 ? 5 + (h % 10) : 0,
    capacityStatus: (["vapaa", "tayttyy", "taynna"] as const)[(h >> 3) % 3]!,
    queue: {
      level,
      waitMinutes: level === "ruuhka" ? 45 : level === "kohtalainen" ? 15 : 0,
      reports: 3 + (h % 20),
    },
  };
}

export async function submitQueueReport(_route: string, _report: QueueReport): Promise<void> {
  await wait(300);
}
