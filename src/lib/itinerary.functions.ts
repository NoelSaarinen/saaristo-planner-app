import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type EventType = "ferry" | "activity" | "accommodation" | "food" | "transport";
export type Itinerary = {
  title: string;
  summary: string;
  route: string[];
  days: {
    day: number;
    title: string;
    events: { time: string; type: EventType; title: string; detail: string; price: number }[];
  }[];
};

const inputSchema = z.object({
  budget: z.number().min(50).max(1000),
  transport: z.enum(["pyora", "auto", "julkinen"]),
  days: z.number().int().min(1).max(14),
  styles: z.array(z.string().max(30)).max(10),
});

const TRANSPORT_FI = { pyora: "pyörä", auto: "auto", julkinen: "julkinen liikenne ja kävely" };

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "summary", "route", "days"],
  properties: {
    title: { type: "string" },
    summary: { type: "string" },
    route: { type: "array", items: { type: "string" } },
    days: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["day", "title", "events"],
        properties: {
          day: { type: "integer" },
          title: { type: "string" },
          events: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["time", "type", "title", "detail", "price"],
              properties: {
                time: { type: "string" },
                type: { type: "string", enum: ["ferry", "activity", "accommodation", "food", "transport"] },
                title: { type: "string" },
                detail: { type: "string" },
                price: { type: "number" },
              },
            },
          },
        },
      },
    },
  },
};

export const generateItinerary = createServerFn({ method: "POST" })
  .inputValidator((d) => inputSchema.parse(d))
  .handler(async ({ data }): Promise<{ itinerary?: Itinerary; error?: string }> => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { error: "Tekoälypalvelua ei ole määritetty." };

    const prompt = `Laadi personoitu matkaohjelma Turun saaristoon (Saaristomeren rengastie: Turku, Parainen, Nauvo, Korppoo, Houtskari, Iniö, Kustavi, Taivassalo, Naantali jne.).
Budjetti yhteensä: ${data.budget >= 1000 ? "1000 € tai enemmän" : data.budget + " €"} per henkilö.
Kulkutapa: ${TRANSPORT_FI[data.transport]}.
Kesto: ${data.days} päivää.
Matkustustyyli: ${data.styles.join(", ") || "vapaa"}.
Vaatimukset: kirjoita suomeksi. Tasan ${data.days} päivää. 3–6 tapahtumaa per päivä, aika muodossa "10:15". Käytä todellisia lauttoja (esim. yhteysalukset, Nauvo–Korppoo lossi, Parainen–Nauvo lossi) ja todellisia paikkoja ja majoituksia. Ilmaisille lautoille hinta 0. Hinnat euroina per henkilö, realistisia; kokonaissumma ei saa ylittää budjettia. "route" = 3–6 pääpysähdystä järjestyksessä. Tiivis "summary" (1–2 lausetta).`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        "Lovable-API-Key": key,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low" },
        input: [
          { role: "system", content: "Olet Turun saariston paikallinen matkasuunnittelija." },
          { role: "user", content: prompt },
        ],
        text: { format: { type: "json_schema", name: "itinerary", strict: true, schema: jsonSchema } },
      }),
    });

    if (!res.ok || !res.body) {
      if (res.status === 429) return { error: "Liian monta pyyntöä. Yritä hetken päästä uudelleen." };
      if (res.status === 402) return { error: "Tekoälykrediitit ovat loppuneet. Lisää krediittejä työtilan asetuksista." };
      console.error("AI gateway error", res.status, await res.text().catch(() => ""));
      return { error: "Matkaohjelman luonti epäonnistui. Yritä uudelleen." };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      let i;
      while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload);
          if (ev.type === "response.output_text.delta") text += ev.delta;
          if (ev.type === "response.failed" || ev.type === "error") {
            console.error("AI stream error", payload);
          }
        } catch {
          /* ignore partial */
        }
      }
    }

    try {
      return { itinerary: JSON.parse(text) as Itinerary };
    } catch {
      return { error: "Tekoäly ei palauttanut kelvollista matkaohjelmaa. Yritä uudelleen." };
    }
  });
