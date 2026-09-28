import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Compass, Map, WalletCards, WifiOff } from "lucide-react";

export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div role="status" className="sticky top-0 z-[70] flex items-start gap-2 bg-foreground/90 px-4 py-2 text-xs text-background backdrop-blur animate-in slide-in-from-top">
      <WifiOff className="mt-0.5 size-3.5 shrink-0" />
      Olet offline-tilassa. Liput ja päivän reitti ovat tallennettu laitteellesi ja toimivat normaalisti.
    </div>
  );
}

const TABS = [
  { to: "/", label: "Suunnittele", icon: Compass },
  { to: "/matkaohjelma", label: "Reitti", icon: Map },
  { to: "/lompakko", label: "Matkalompakko", icon: WalletCards },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 h-16 border-t border-border bg-card/95 backdrop-blur">
      <div className="mx-auto grid h-full max-w-xl grid-cols-3">
        {TABS.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="flex flex-col items-center justify-center gap-0.5 text-[11px] font-semibold text-muted-foreground data-[status=active]:text-primary"
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
