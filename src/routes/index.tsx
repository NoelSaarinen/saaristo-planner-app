import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Anchor,
  ArrowRight,
  Bike,
  CalendarDays,
  Car,
  Check,
  Compass,
  Footprints,
  Loader2,
  MapPin,
  Minus,
  Plus,
  Sparkles,
  Waves,
  Wind,
} from "lucide-react";
import heroImg from "@/assets/hero-archipelago.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saaristo — Löydä Turun saaristo vaivattomasti" },
      {
        name: "description",
        content:
          "Suunnittele täydellinen matka Turun saaristoon. Kerro budjettisi, kulkuneuvosi ja matkasi tyyli — me rakennamme reitin.",
      },
      { property: "og:title", content: "Saaristo — Löydä Turun saaristo vaivattomasti" },
      {
        property: "og:description",
        content:
          "Suunnittele täydellinen matka Turun saaristoon budjetin, kulkuneuvon ja matkatyylisi mukaan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TRANSPORT_OPTIONS = [
  { id: "pyora", label: "Pyörä", hint: "Saaristoreitti", icon: Bike },
  { id: "auto", label: "Auto", hint: "Pikatie & lautat", icon: Car },
  { id: "julkinen", label: "Julkinen / Kävely", hint: "Bussi & laivat", icon: Footprints },
] as const;

const STYLE_TAGS = ["Rento", "Aktiivinen", "Luksus", "Luonto", "Kulttuuri", "Ruoka"] as const;

const MAX_BUDGET = 1000;
const MIN_BUDGET = 50;

const PLANNING_PHRASES = [
  "Analysoidaan reittivaihtoehtoja…",
  "Tarkistetaan lautta-aikatauluja…",
  "Etsitään parhaita majapaikkoja…",
  "Lasketaan kokonaishintaa…",
] as const;
const PHASE_DURATION_MS = 750; // 4 phrases × 750ms = 3s total

function Index() {
  const [budget, setBudget] = useState(300);
  const [transport, setTransport] = useState<string | null>(null);
  const [days, setDays] = useState(3);
  const [styles, setStyles] = useState<string[]>(["Luonto"]);
  const [planning, setPlanning] = useState(false);
  const [planned, setPlanned] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const budgetLabel = budget >= MAX_BUDGET ? "1000 €+" : `${budget} €`;
  const sliderFill = useMemo(
    () => `${((budget - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100}%`,
    [budget],
  );

  const toggleStyle = (tag: string) =>
    setStyles((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  const handlePlan = () => {
    setPhraseIndex(0);
    setPlanned(false);
    setPlanning(true);
    window.setTimeout(() => {
      setPlanning(false);
      setPlanned(true);
      window.setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }, PLANNING_PHRASES.length * PHASE_DURATION_MS);
  };

  // Cycle the planning phrases and lock page scroll while the overlay is up.
  useEffect(() => {
    if (!planning) return;
    document.body.style.overflow = "hidden";
    const cycle = window.setInterval(
      () => setPhraseIndex((i) => Math.min(i + 1, PLANNING_PHRASES.length - 1)),
      PHASE_DURATION_MS,
    );
    return () => {
      document.body.style.overflow = "";
      window.clearInterval(cycle);
    };
  }, [planning]);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero */}
      <header className="relative">
        <img
          src={heroImg}
          alt="Turun saaristo: punainen rivatalo meren äärellä auringonnousun aikaan"
          width={1920}
          height={1200}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/20 to-background/95" />

        <nav className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
              <Anchor className="size-4" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              Saaristo
            </span>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
            <MapPin className="size-3.5 text-primary" />
            Turku, Suomi
          </span>
        </nav>

        <div className="relative z-10 mx-auto max-w-5xl px-5 pt-14 pb-24 sm:pt-20 sm:pb-32">
          <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1.5 text-xs font-semibold text-secondary-foreground">
            <Waves className="size-3.5" />
            Yli 40 000 saarta. Yksi reitti.
          </p>
          <h1 className="mt-5 max-w-xl font-display text-4xl font-bold leading-tight tracking-tight text-foreground text-balance sm:text-6xl">
            Löydä Turun saaristo vaivattomasti
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Kerro, miten haluat matkustaa — rakennamme sinulle reitin, joka sopii
            juuri sinulle.
          </p>
        </div>
      </header>

      {/* Planner */}
      <main className="relative z-10 mx-auto -mt-14 max-w-xl px-4 pb-16 sm:px-5">
        <section className="rounded-4xl border border-border/70 bg-card p-6 shadow-[0_24px_60px_-24px_oklch(0.45_0.07_220/0.25)] sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
              <Compass className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight">
                Suunnittele matkasi
              </h2>
              <p className="text-sm text-muted-foreground">
                Neljä valintaa — ja reitti on valmis.
              </p>
            </div>
          </div>

          {/* 1. Budjetti */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <label htmlFor="budjetti" className="text-sm font-semibold text-foreground">
                Budjetti
              </label>
              <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold tabular-nums text-primary">
                {budgetLabel}
              </span>
            </div>
            <input
              id="budjetti"
              type="range"
              min={MIN_BUDGET}
              max={MAX_BUDGET}
              step={10}
              value={budget}
              aria-label="Budjetti euroina"
              onChange={(e) => setBudget(Number(e.target.value))}
              style={{ ["--fill" as string]: sliderFill }}
              className="mt-4 w-full cursor-pointer"
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{MIN_BUDGET} €</span>
              <span>{MAX_BUDGET} €+</span>
            </div>
          </div>

          {/* 2. Kulkuneuvo */}
          <div className="mt-8">
            <span className="text-sm font-semibold text-foreground">Kulkuneuvo</span>
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {TRANSPORT_OPTIONS.map(({ id, label, hint, icon: Icon }) => {
                const selected = transport === id;
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setTransport(id)}
                    className={`flex flex-col items-center gap-1.5 rounded-2xl border px-2 py-4 text-center transition-all duration-200 active:scale-95 ${
                      selected
                        ? "border-primary bg-primary text-primary-foreground shadow-md"
                        : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-muted/60"
                    }`}
                  >
                    <Icon className={`size-6 ${selected ? "" : "text-primary"}`} />
                    <span className="text-xs font-semibold leading-tight sm:text-sm">
                      {label}
                    </span>
                    <span
                      className={`text-[10px] leading-tight sm:text-xs ${
                        selected ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Kesto */}
          <div className="mt-8">
            <span className="text-sm font-semibold text-foreground">Kesto</span>
            <div className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-background px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarDays className="size-4 text-primary" />
                Päivää saaristossa
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Vähennä päiviä"
                  onClick={() => setDays((d) => Math.max(1, d - 1))}
                  className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted active:scale-90"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center font-display text-lg font-semibold tabular-nums">
                  {days}
                </span>
                <button
                  type="button"
                  aria-label="Lisää päiviä"
                  onClick={() => setDays((d) => Math.min(14, d + 1))}
                  className="grid size-9 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted active:scale-90"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Matkan tyyli */}
          <div className="mt-8">
            <span className="text-sm font-semibold text-foreground">Matkan tyyli</span>
            <p className="mt-1 text-xs text-muted-foreground">Valitse yksi tai useampi</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {STYLE_TAGS.map((tag) => {
                const selected = styles.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleStyle(tag)}
                    className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
                      selected
                        ? "border-accent bg-accent text-accent-foreground"
                        : "border-border bg-background text-foreground hover:border-accent/50 hover:bg-muted/60"
                    }`}
                  >
                    {selected && <Check className="size-3.5" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handlePlan}
            disabled={planning}
            className="cta-gradient mt-9 flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 font-display text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] disabled:opacity-80"
          >
            {planning ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Laaditaan reittiä…
              </>
            ) : (
              <>
                <Sparkles className="size-5" />
                Suunnittele reitti
                <ArrowRight className="size-5" />
              </>
            )}
          </button>

          {/* Result preview */}
          {planned && (
            <div
              ref={resultRef}
              className="mt-6 scroll-mt-6 animate-in fade-in slide-in-from-bottom-3 rounded-3xl border border-border bg-muted/50 p-5 duration-500"
            >
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Wind className="size-4 text-accent" />
                Esikatselu: {days} päivän reitti · {budgetLabel}
              </div>
              <ol className="mt-3 space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    1
                  </span>
                  <span><strong className="text-foreground">Turku → Naantali</strong> — vanha kaupunki ja ranta-café</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    2
                  </span>
                  <span><strong className="text-foreground">Kustavi & Vartsala</strong> — saarihyppyi lautalla</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    3
                  </span>
                  <span><strong className="text-foreground">Sauramaa</strong> — aurinkolasku laituri-illoottelissa</span>
                </li>
              </ol>
              <p className="mt-3 text-xs italic text-muted-foreground">
                Tämä on prototyyppinäkymä — koko reitti rakentuu pian.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Full-screen planning overlay */}
      {planning && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 px-6 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative grid place-items-center">
            <span className="absolute size-24 rounded-full bg-primary/20 animate-ping" />
            <span className="grid size-24 place-items-center rounded-full bg-primary text-primary-foreground shadow-xl shadow-primary/30">
              <MapPin className="size-10" />
            </span>
          </div>
          <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
            <Sparkles className="size-3.5" />
            Tekoäly rakentaa matkaasi
          </p>
          <p
            key={phraseIndex}
            aria-live="polite"
            className="mt-4 h-7 text-center font-display text-lg font-semibold text-foreground animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {PLANNING_PHRASES[phraseIndex]}
          </p>
          <div className="mt-6 w-full max-w-xs">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="planning-progress h-full w-full rounded-full bg-accent" />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Loader2 className="size-3.5 animate-spin" />
                {days} päivää · {budgetLabel}
              </span>
              <span className="tabular-nums">
                {Math.round(((phraseIndex + 1) / PLANNING_PHRASES.length) * 100)} %
              </span>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Anchor className="size-3.5 text-primary" />
          Saaristo · Turun saariston matkasuunnittelija
        </span>
      </footer>
    </div>
  );
}
