"use client";

import { startTransition, useActionState, useState, type FormEvent, type KeyboardEvent } from "react";
import { requestQuote, type QuoteState } from "@/app/actions";
import { formatMoney, goalById, goals, moduleById, modules, units, type Module } from "@/lib/catalog";
import { useUnit } from "./unit-context";

const initialState: QuoteState = { status: "idle" };

export function PackageBuilder() {
  const { unit, setUnit } = useUnit();
  const [goal, setGoal] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [clientError, setClientError] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState(requestQuote, initialState);

  const items = selected.map((id) => moduleById.get(id)).filter((m): m is Module => Boolean(m));
  const total = items.reduce((sum, m) => sum + m.price, 0);

  function chooseGoal(id: string) {
    setGoal(id);
    setClientError(null);
  }

  function toggleModule(id: string, on: boolean) {
    setSelected((prev) => (on ? [...prev.filter((x) => x !== id), id] : prev.filter((x) => x !== id)));
    setClientError(null);
  }

  // Dispatch by hand: a plain form action would reset the form afterwards, which unchecks
  // the controlled goal and module inputs while their state still holds them.
  // Without JavaScript the form still posts through `action`.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = !goal
      ? "Эхний алхамд зорилгоо сонгоно уу."
      : selected.length === 0
        ? "Хоёр дахь алхамд дор хаяж нэг үйлчилгээ сонгоно уу."
        : null;
    setClientError(problem);
    if (problem) return;
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const targets: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: units.length - 1,
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    const next = units[(targets[event.key] + units.length) % units.length];
    setUnit(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  }

  const message = clientError ?? (state.status === "idle" ? "" : state.message);
  const tone = clientError || state.status === "error" ? "error" : "success";

  return (
    <div className="builder-layout">
      <form action={formAction} onSubmit={onSubmit} className="builder-form">
        <fieldset className="step">
          <legend className="step-head">
            <span className="step-num">1</span>
            <span className="step-title">Юунд хүрэх вэ?</span>
          </legend>
          <p className="step-hint">Хамгийн чухал зорилгоо сонгоно уу.</p>
          <div className="goal-grid">
            {goals.map((g) => (
              <label key={g.id} className="goal">
                <input
                  type="radio"
                  name="goal"
                  value={g.id}
                  checked={goal === g.id}
                  onChange={() => chooseGoal(g.id)}
                />
                <span>{g.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="step" id="modules">
          <legend className="step-head">
            <span className="step-num">2</span>
            <span className="step-title">Юу хэрэгтэй вэ?</span>
          </legend>
          <p className="step-hint">Нэгээс олон үйлчилгээ сонгож болно. Бусад хэсгийн сонголт хадгалагдана.</p>

          <div className="unit-tabs" role="tablist" aria-label="Үйлчилгээний чиглэл">
            {units.map((u, i) => {
              const count = selected.filter((id) => moduleById.get(id)?.unit === u.id).length;
              return (
                <button
                  key={u.id}
                  id={`tab-${u.id}`}
                  type="button"
                  role="tab"
                  className="unit-tab"
                  data-unit={u.id}
                  aria-selected={unit === u.id}
                  aria-controls={`panel-${u.id}`}
                  tabIndex={unit === u.id ? 0 : -1}
                  onClick={() => setUnit(u.id)}
                  onKeyDown={(event) => onTabKeyDown(event, i)}
                >
                  {u.name}
                  {count > 0 && <span className="unit-tab-count">{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Every panel stays in the form, so choices on hidden tabs are still submitted. */}
          {units.map((u) => (
            <div
              key={u.id}
              id={`panel-${u.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${u.id}`}
              hidden={unit !== u.id}
              className="module-list"
            >
              {modules
                .filter((m) => m.unit === u.id)
                .map((m) => (
                  <label key={m.id} className="module" data-unit={m.unit}>
                    <input
                      type="checkbox"
                      name="modules"
                      value={m.id}
                      checked={selected.includes(m.id)}
                      onChange={(event) => toggleModule(m.id, event.currentTarget.checked)}
                    />
                    <span className="module-text">
                      <span className="module-name">{m.name}</span>
                      <span className="module-detail">{m.detail}</span>
                    </span>
                    <span className="module-price num">{formatMoney(m.price)}</span>
                  </label>
                ))}
            </div>
          ))}
        </fieldset>

        <fieldset className="step">
          <legend className="step-head">
            <span className="step-num">3</span>
            <span className="step-title">Хэнтэй холбогдох вэ?</span>
          </legend>
          <p className="step-hint">Тооцоогоо илгээгээрэй. Нарийвчилсан хүрээг discovery дуудлагаар баталгаажуулна.</p>
          <div className="field-grid">
            <label className="field">
              <span>Нэр</span>
              <input name="name" type="text" autoComplete="name" required />
            </label>
            <label className="field">
              <span>Бизнес, байгууллага</span>
              <input name="company" type="text" autoComplete="organization" required />
            </label>
            <label className="field">
              <span>Утас эсвэл имэйл</span>
              <input name="contact" type="text" autoComplete="email" required />
            </label>
          </div>
          <div className="submit-row">
            <button className="btn btn-primary" type="submit" disabled={pending}>
              {pending ? "Илгээж байна…" : "Үнийн санал хүсэх"}
            </button>
            <p className="form-status" role="status" data-tone={message ? tone : undefined}>
              {message}
            </p>
          </div>
        </fieldset>
      </form>

      <aside className="summary" aria-labelledby="summary-title">
        <h3 id="summary-title" className="summary-title">
          Таны багц
        </h3>
        <dl className="summary-meta">
          <div>
            <dt>Зорилго</dt>
            <dd>{goal ? goalById.get(goal)?.label : "Сонгоогүй"}</dd>
          </div>
          <div>
            <dt>Үйлчилгээ</dt>
            <dd className="num">{items.length}</dd>
          </div>
        </dl>
        <ul className="summary-items">
          {items.length === 0 ? (
            <li className="summary-empty">Хоёр дахь алхмаас үйлчилгээ сонгоно уу.</li>
          ) : (
            items.map((m) => (
              <li key={m.id} data-unit={m.unit}>
                <span>{m.name}</span>
                <span className="num">{formatMoney(m.price)}</span>
              </li>
            ))
          )}
        </ul>
        <div className="summary-total">
          <span>Урьдчилсан нийт</span>
          <strong className="num" aria-live="polite">
            {formatMoney(total)}
          </strong>
        </div>
        <p className="summary-note">Media spend, татвар болон гуравдагч талын production-ийг тусад нь тооцно.</p>
      </aside>
    </div>
  );
}
