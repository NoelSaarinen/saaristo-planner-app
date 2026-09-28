import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Users, WifiOff } from "lucide-react";
import { toast } from "sonner";
import {
  fetchFerryDepartures,
  submitQueueReport,
  type FerryDeparture,
  type QueueReport,
} from "@/lib/ferry-service";

type State =
  | { status: "loading" }
  | { status: "success"; data: FerryDeparture }
  | { status: "error" };

const CAPACITY = {
  vapaa: "Tilaa hyvin",
  tayttyy: "Täyttymässä",
  taynna: "Lähes täynnä",
} as const;

const QUEUE = {
  normaali: { label: "Normaali", cls: "bg-accent/20 text-foreground", dot: "bg-accent" },
  kohtalainen: { label: "Kohtalainen", cls: "bg-sand/60 text-foreground", dot: "bg-warning" },
  ruuhka: { label: "Ruuhkautunut", cls: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
} as const;

const REPORTS: { id: QueueReport; label: string }[] = [
  { id: "ei-jonoa", label: "Ei jonoa" },
  { id: "hieman", label: "Hieman jonoa" },
  { id: "pitka", label: "Todella pitkä jono" },
];

export function LiveFerryCard({ route, time }: { route: string; time: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [sheet, setSheet] = useState(false);

  const load = useCallback(() => {
    setState({ status: "loading" });
    fetchFerryDepartures(route, time)
      .then((data) => setState({ status: "success", data }))
      .catch(() => setState({ status: "error" }));
  }, [route, time]);

  useEffect(load, [load]);

  const report = async (r: QueueReport) => {
    setSheet(false);
    await submitQueueReport(route, r);
    toast.success("Kiitos ilmoituksesta!", { description: "Autat muita matkailijoita." });
  };

  if (state.status === "loading") {
    return (
      <div className="mt-3 space-y-2 rounded-xl bg-muted/50 p-3" aria-busy="true" aria-label="Tarkistetaan aikatauluja">
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
        <p className="flex items-center gap-2 text-xs font-medium text-destructive">
          <WifiOff className="size-4 shrink-0" /> Yhteys aikataulupalveluun epäonnistui
        </p>
        <button
          type="button"
          onClick={load}
          className="flex shrink-0 items-center gap-1 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm active:scale-95"
        >
          <RefreshCw className="size-3.5" /> Yritä uudelleen
        </button>
      </div>
    );
  }

  const d = state.data;
  const q = QUEUE[d.queue.level];
  return (
    <div className="mt-3 rounded-xl bg-muted/50 p-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-accent" />
          </span>
          Live-data
        </span>
        <span className="text-[11px] text-muted-foreground">{d.vesselName}</span>
      </div>
      <p className="mt-1 font-display text-lg font-bold tabular-nums">
        Lähtö {d.departureTime}
        {d.delayMinutes > 0 ? (
          <span className="ml-2 text-xs font-semibold text-destructive">+{d.delayMinutes} min myöhässä</span>
        ) : (
          <span className="ml-2 text-xs font-semibold text-accent-foreground">Ajallaan</span>
        )}
      </p>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        <Users className="size-3.5" /> {CAPACITY[d.capacityStatus]}
      </p>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${q.cls}`}>
          <span className={`size-2 rounded-full ${q.dot}`} />
          Jonotilanne: {q.label}
          {d.queue.waitMinutes > 0 && `, arvio ${d.queue.waitMinutes} min`}
        </span>
        <button
          type="button"
          onClick={() => setSheet(true)}
          className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-primary active:scale-95"
        >
          Ilmoita jonon pituus
        </button>
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">Perustuu {d.queue.reports} matkailijan ilmoitukseen</p>

      {sheet && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <button type="button" aria-label="Sulje" className="absolute inset-0 bg-foreground/40 animate-in fade-in" onClick={() => setSheet(false)} />
          <div className="relative w-full max-w-xl rounded-t-4xl bg-card p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-muted" />
            <h3 className="font-display text-lg font-semibold">Millainen jono on nyt?</h3>
            <p className="text-sm text-muted-foreground">{route}</p>
            <div className="mt-4 grid gap-2">
              {REPORTS.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => report(r.id)}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3 text-left font-semibold active:scale-[0.98]"
                >
                  <span className={`size-3 rounded-full ${["bg-accent", "bg-warning", "bg-destructive"][i]}`} />
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
