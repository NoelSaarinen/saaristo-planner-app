import { useEffect, useState } from "react";
import { CloudRain, Sparkles, Thermometer, Wind } from "lucide-react";
import { fetchDayWeather, HIGH_WIND, type DayWeather as W } from "@/lib/weather-service";

export function DayWeather({
  day,
  isBike,
  onSwitchToBus,
}: {
  day: number;
  isBike: boolean;
  onSwitchToBus: () => void;
}) {
  const [w, setW] = useState<W | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchDayWeather(day).then(setW);
  }, [day]);

  if (!w) return <div className="mt-3 h-10 animate-pulse rounded-2xl bg-muted" />;

  return (
    <>
      <div className="mt-3 flex items-center justify-between rounded-2xl bg-sea-soft/60 px-4 py-2.5 text-sm">
        <span className="flex items-center gap-1.5 font-semibold"><Thermometer className="size-4 text-primary" />{w.temperature}°C</span>
        <span className={`flex items-center gap-1.5 ${w.windSpeed > HIGH_WIND ? "font-semibold text-destructive" : ""}`}>
          <Wind className="size-4 text-primary" />{w.windSpeed} m/s
        </span>
        <span className="flex items-center gap-1.5"><CloudRain className="size-4 text-primary" />{w.rainProbability} %</span>
      </div>
      {isBike && w.windSpeed > HIGH_WIND && !dismissed && (
        <div className="mt-3 rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 animate-in fade-in slide-in-from-top-2">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
            <Sparkles className="size-3.5" /> AI-hälytys
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            Kovaa tuulta luvassa huomiselle. Haluatko päivittää matkasuunnitelmaa ja vaihtaa pyöräilyn bussikuljetukseen?
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => { onSwitchToBus(); setDismissed(true); }} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground active:scale-95">
              Kyllä, etsi bussit
            </button>
            <button type="button" onClick={() => setDismissed(true)} className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold active:scale-95">
              Jatka alkuperäisellä
            </button>
          </div>
        </div>
      )}
    </>
  );
}
