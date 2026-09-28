import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  BedDouble,
  Bike,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  Mountain,
  QrCode,
  Ship,
  Smartphone,
  Sparkles,
  Utensils,
  Wallet,
  X,
} from "lucide-react";
import type { EventType, Itinerary } from "@/lib/itinerary.functions";

export const Route = createFileRoute("/matkaohjelma")({
  head: () => ({
    meta: [
      { title: "Matkaohjelmasi — Saaristo" },
      { name: "description", content: "Tekoälyn laatima personoitu matkaohjelma Turun saaristoon." },
      { property: "og:title", content: "Matkaohjelmasi — Saaristo" },
      { property: "og:description", content: "Päivä päivältä etenevä reitti lauttoineen, aktiviteetteineen ja majoituksineen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ItineraryPage,
});

const EVENT_STYLE: Record<EventType, { icon: typeof Ship; label: string; cls: string }> = {
  ferry: { icon: Ship, label: "Lautta", cls: "bg-primary text-primary-foreground" },
  activity: { icon: Mountain, label: "Aktiviteetti", cls: "bg-accent text-accent-foreground" },
  accommodation: { icon: BedDouble, label: "Majoitus", cls: "bg-secondary text-secondary-foreground" },
  food: { icon: Utensils, label: "Ruoka", cls: "bg-muted text-foreground" },
  transport: { icon: Bus, label: "Siirtymä", cls: "bg-muted text-foreground" },
};

const ORDER_ITEMS = [
  { icon: Ship, label: "Lauttaliput", price: 15 },
  { icon: BedDouble, label: "Majoitus", price: 150 },
  { icon: Bike, label: "Pyörävuokraus", price: 80 },
];
const ORDER_TOTAL = ORDER_ITEMS.reduce((s, i) => s + i.price, 0);

const PAY_METHODS = [
  { id: "mobilepay", label: "MobilePay", icon: Smartphone },
  { id: "applepay", label: "Apple Pay", icon: Wallet },
  { id: "card", label: "Luottokortti", icon: CreditCard },
];

type CheckoutStep = "closed" | "pay" | "processing" | "success" | "tickets";

function FakeQr({ seed }: { seed: number }) {
  const cells = Array.from({ length: 49 }, (_, i) => (i * 7 + seed * 13) % 3 !== 0);
  return (
    <div className="grid grid-cols-7 gap-0.5 rounded-xl bg-card p-3">
      {cells.map((on, i) => (
        <span key={i} className={`size-2.5 rounded-[2px] ${on ? "bg-foreground" : "bg-transparent"}`} />
      ))}
    </div>
  );
}

function ItineraryPage() {
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Itinerary | null>(null);
  const [step, setStep] = useState<CheckoutStep>("closed");
  const [method, setMethod] = useState("mobilepay");

  useEffect(() => {
    if (step !== "closed") document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [step]);

  const handlePay = () => {
    setStep("processing");
    window.setTimeout(() => setStep("success"), 1600);
  };

  useEffect(() => {
    const raw = sessionStorage.getItem("saaristo-itinerary");
    if (!raw) {
      navigate({ to: "/" });
      return;
    }
    setTrip(JSON.parse(raw));
    window.scrollTo(0, 0);
  }, [navigate]);

  if (!trip) return <div className="min-h-screen bg-background" />;

  const total = Math.round(
    trip.days.reduce((s, d) => s + d.events.reduce((a, e) => a + (e.price || 0), 0), 0),
  );

  return (
    <div className="min-h-screen bg-background pb-32 font-sans animate-in fade-in duration-500">
      {/* Map */}
      <div className="relative h-64 overflow-hidden bg-secondary sm:h-80">
        <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
          <rect width="400" height="260" className="fill-secondary" />
          {[
            [60, 40, 38], [150, 90, 26], [250, 60, 30], [320, 150, 34], [110, 190, 30],
            [210, 200, 22], [360, 60, 18], [30, 130, 20],
          ].map(([cx, cy, r], i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={r} ry={(r ?? 0) * 0.7} className="fill-background/70" />
          ))}
          <path
            d={trip.route
              .map((_, i) => {
                const x = 40 + (i * 320) / Math.max(1, trip.route.length - 1);
                const y = 180 - Math.sin(i * 1.3) * 60 - i * 10;
                return `${i ? "L" : "M"}${x},${y}`;
              })
              .join(" ")}
            className="fill-none stroke-primary"
            strokeWidth="3"
            strokeDasharray="8 6"
            strokeLinecap="round"
          />
        </svg>
        {trip.route.map((stop, i) => {
          const x = 40 + (i * 320) / Math.max(1, trip.route.length - 1);
          const y = 180 - Math.sin(i * 1.3) * 60 - i * 10;
          return (
            <div
              key={stop + i}
              className="absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${(x / 400) * 100}%`, top: `${(y / 260) * 100}%` }}
            >
              <div className="flex flex-col items-center">
                <span className="whitespace-nowrap rounded-full bg-card px-2 py-0.5 text-[10px] font-semibold text-foreground shadow">
                  {stop}
                </span>
                <MapPin className="size-5 fill-primary text-primary-foreground" />
              </div>
            </div>
          );
        })}
        <Link
          to="/"
          className="absolute left-4 top-4 grid size-10 place-items-center rounded-full bg-card/90 text-foreground shadow backdrop-blur"
          aria-label="Takaisin"
        >
          <ArrowLeft className="size-5" />
        </Link>
      </div>

      <main className="relative z-10 mx-auto -mt-8 max-w-xl px-4">
        <section className="rounded-4xl border border-border/70 bg-card p-6 shadow-lg">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            <Sparkles className="size-3.5" /> Tekoälyn laatima
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight">{trip.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{trip.summary}</p>
          <p className="mt-3 text-xs font-medium text-primary">{trip.route.join(" → ")}</p>
        </section>

        {trip.days.map((day) => (
          <section key={day.day} className="mt-8">
            <h2 className="flex items-baseline gap-2 font-display text-lg font-semibold [&>span]:min-w-0">
              <span className="shrink-0 whitespace-nowrap">Päivä {day.day}</span>
              <span className="text-sm font-normal text-muted-foreground">· {day.title}</span>
            </h2>
            <ol className="relative mt-4 space-y-3 border-l-2 border-dashed border-border pl-6">
              {day.events.map((ev, i) => {
                const s = EVENT_STYLE[ev.type] ?? EVENT_STYLE.activity;
                const Icon = s.icon;
                return (
                  <li key={i} className="relative">
                    <span className={`absolute -left-[37px] top-3 grid size-6 place-items-center rounded-full ring-4 ring-background ${s.cls}`}>
                      <Icon className="size-3.5" />
                    </span>
                    <div className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-muted-foreground">
                          Klo {ev.time} · {s.label}
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">
                          {ev.price > 0 ? `${Math.round(ev.price)} €` : "Ilmainen"}
                        </span>
                      </div>
                      <p className="mt-1 font-semibold text-foreground">{ev.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{ev.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </main>

      {/* Sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="text-xs text-muted-foreground">Yhteensä</p>
            <p className="font-display text-xl font-bold tabular-nums">{total} €</p>
          </div>
          <button
            type="button"
            className="cta-gradient flex items-center gap-2 rounded-2xl px-5 py-3 font-display text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 active:scale-95"
          >
            <CreditCard className="size-4" /> Varaa ja maksa matka
          </button>
        </div>
      </div>
    </div>
  );
}
