import { BedDouble, Bike, Ship } from "lucide-react";

export const ORDER_ITEMS = [
  { icon: Ship, label: "Lauttaliput", detail: "Parainen – Nauvo – Korppoo", price: 15 },
  { icon: BedDouble, label: "Majoitus", detail: "Hotel Nauvo · 1 yö", price: 150 },
  { icon: Bike, label: "Pyörävuokraus", detail: "2 päivää", price: 80 },
];
export const ORDER_TOTAL = ORDER_ITEMS.reduce((s, i) => s + i.price, 0);

const WALLET_KEY = "saaristo-wallet";
export const saveWallet = () => localStorage.setItem(WALLET_KEY, "1");
export const hasWallet = () => localStorage.getItem(WALLET_KEY) === "1";

export function FakeQr({ seed }: { seed: number }) {
  const cells = Array.from({ length: 49 }, (_, i) => (i * 7 + seed * 13) % 3 !== 0);
  return (
    <div className="grid grid-cols-7 gap-0.5 rounded-xl bg-card p-3">
      {cells.map((on, i) => (
        <span key={i} className={`size-2.5 rounded-[2px] ${on ? "bg-foreground" : "bg-transparent"}`} />
      ))}
    </div>
  );
}
