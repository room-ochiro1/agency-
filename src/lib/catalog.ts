// Shared by the server action (which re-prices every request) and the client builder.
// Prices are placeholders from the MVP: replace them with AGENCY's approved price sheet.

export type UnitId = "growth" | "studios" | "entertainment";

export type Unit = {
  id: UnitId;
  name: string;
  /** One-line promise shown on the services section. */
  promise: string;
  offerings: string[];
};

export type Goal = { id: string; label: string };

export type Module = {
  id: string;
  unit: UnitId;
  name: string;
  detail: string;
  price: number;
};

export const units: Unit[] = [
  {
    id: "growth",
    name: "Growth",
    promise: "Эрэлтийг өсгөж, борлуулалтыг хэмжинэ.",
    offerings: ["Стратеги ба positioning", "Performance marketing", "CRM ба analytics"],
  },
  {
    id: "studios",
    name: "Studios",
    promise: "Санааг харагдах, сонсогдох бүтээл болгоно.",
    offerings: ["Photo ба video", "Short-form контент", "Brand design"],
  },
  {
    id: "entertainment",
    name: "Entertainment",
    promise: "Анхаарлыг туршлага, соёл, community болгоно.",
    offerings: ["Event ба activation", "Creator partnership", "Branded entertainment"],
  },
];

export const goals: Goal[] = [
  { id: "sales", label: "Борлуулалт нэмэх" },
  { id: "brand", label: "Брэндээ хөгжүүлэх" },
  { id: "content", label: "Контент бүтээх" },
  { id: "event", label: "Эвент зохион байгуулах" },
  { id: "full", label: "Цогц өсөлт" },
];

export const modules: Module[] = [
  { id: "growth-diagnose", unit: "growth", name: "Growth Diagnose Sprint", detail: "Зорилго, funnel, санал, KPI-н оношилгоо", price: 450_000 },
  { id: "growth-launch", unit: "growth", name: "Launch Sprint", detail: "Landing, creative, tracking, launch", price: 850_000 },
  { id: "growth-retainer", unit: "growth", name: "Growth Retainer", detail: "Сар бүрийн туршилт, media, тайлан", price: 1_200_000 },
  { id: "studios-social", unit: "studios", name: "Social Content Kit", detail: "12 short-form asset ба creative direction", price: 650_000 },
  { id: "studios-film", unit: "studios", name: "Brand Film", detail: "Concept, production, edit", price: 1_200_000 },
  { id: "studios-design", unit: "studios", name: "Brand Design Sprint", detail: "Visual system, key visual, template", price: 550_000 },
  { id: "ent-event", unit: "entertainment", name: "Event Concept", detail: "Concept, run-of-show, activation", price: 900_000 },
  { id: "ent-creator", unit: "entertainment", name: "Creator Partnership", detail: "Creator сонголт, brief, зохицуулалт", price: 600_000 },
  { id: "ent-production", unit: "entertainment", name: "Event Production", detail: "Бүрэн production ба live контент", price: 1_800_000 },
];

export const moduleById = new Map(modules.map((m) => [m.id, m]));
export const goalById = new Map(goals.map((g) => [g.id, g]));

/** Deterministic on server and client (no Intl locale data), so hydration never mismatches. */
export function formatMoney(value: number): string {
  return `${String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}₮`;
}

export function totalOf(ids: Iterable<string>): number {
  let sum = 0;
  for (const id of ids) sum += moduleById.get(id)?.price ?? 0;
  return sum;
}
