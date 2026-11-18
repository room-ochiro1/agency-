"use server";

import { formatMoney, goalById, moduleById, totalOf } from "@/lib/catalog";

export type QuoteState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; message: string };

const text = (value: FormDataEntryValue | null) =>
  typeof value === "string" ? value.trim().slice(0, 200) : "";

export async function requestQuote(_prev: QuoteState, formData: FormData): Promise<QuoteState> {
  const name = text(formData.get("name"));
  const company = text(formData.get("company"));
  const contact = text(formData.get("contact"));
  const goal = goalById.get(text(formData.get("goal")));
  // Re-price on the server from the catalog; never trust a total sent by the browser.
  const moduleIds = formData
    .getAll("modules")
    .map((v) => text(v))
    .filter((id) => moduleById.has(id));

  if (!goal) return { status: "error", message: "Эхний алхамд зорилгоо сонгоно уу." };
  if (moduleIds.length === 0)
    return { status: "error", message: "Хоёр дахь алхамд дор хаяж нэг үйлчилгээ сонгоно уу." };
  if (!name || !company || !contact)
    return { status: "error", message: "Нэр, байгууллага, холбоо барих мэдээллээ бөглөнө үү." };

  const total = totalOf(moduleIds);

  // TODO(production): send this lead to the CRM or form endpoint (README, step 1).
  console.info("[quote request]", { name, company, contact, goal: goal.id, moduleIds, total });

  return {
    status: "success",
    message: `Хүсэлт хүлээн авлаа. ${formatMoney(total)}-ийн урьдчилсан багцаар тантай удахгүй холбогдоно.`,
  };
}
