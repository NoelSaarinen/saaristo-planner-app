import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CloudOff, WalletCards } from "lucide-react";
import { FakeQr, hasWallet, ORDER_ITEMS } from "@/lib/tickets";
import { useOnline } from "@/components/AppChrome";

export const Route = createFileRoute("/lompakko")({
  head: () => ({
    meta: [
      { title: "Matkalompakko — Saaristo" },
      { name: "description", content: "Kaikki lautta-, hotelli- ja vuokrausliput QR-koodeina yhdessä paikassa." },
      { property: "og:title", content: "Matkalompakko — Saaristo" },
      { property: "og:description", content: "Liput toimivat myös ilman verkkoyhteyttä." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: WalletPage,
});

function WalletPage() {
  const online = useOnline();
  const [owned, setOwned] = useState<boolean | null>(null);
  useEffect(() => setOwned(hasWallet()), []);

  return (
    <div className={`min-h-screen px-4 pb-24 pt-8 font-sans transition-colors ${online ? "bg-background" : "bg-foreground/80"}`}>
      <div className="mx-auto max-w-xl">
        <h1 className={`font-display text-2xl font-bold ${online ? "text-foreground" : "text-background"}`}>Matkalompakko</h1>
        <p className={`mt-1 flex items-center gap-1.5 text-sm ${online ? "text-muted-foreground" : "text-background/80"}`}>
          <CloudOff className="size-4" /> Kaikki liput tallennettu laitteelle – toimivat offline
        </p>

        {owned === false && (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
            <WalletCards className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-3 font-semibold">Ei vielä lippuja</p>
            <p className="text-sm text-muted-foreground">Varaa matka, niin liput ilmestyvät tänne.</p>
            <Link to="/" className="mt-4 inline-block rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Suunnittele matka
            </Link>
          </div>
        )}

        {owned && (
          <ul className="mt-6 space-y-4">
            {ORDER_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <li key={item.label} className="flex items-center gap-4 rounded-3xl bg-card p-4 shadow-lg">
                  <div className="shrink-0 rounded-2xl ring-2 ring-border"><FakeQr seed={i + 1} /></div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-semibold"><Icon className="size-4 text-primary" />{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.detail}</p>
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-[11px] font-semibold">
                      <CloudOff className="size-3" /> Saatavilla offline
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
