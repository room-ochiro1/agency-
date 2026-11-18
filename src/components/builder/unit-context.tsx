"use client";

import { createContext, use, useState, type ReactNode } from "react";
import type { UnitId } from "@/lib/catalog";

type UnitContextValue = { unit: UnitId; setUnit: (unit: UnitId) => void };

const UnitContext = createContext<UnitContextValue | null>(null);

/** Shares the builder's active unit tab, so the services section can preselect it. */
export function UnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnit] = useState<UnitId>("growth");
  return <UnitContext value={{ unit, setUnit }}>{children}</UnitContext>;
}

export function useUnit(): UnitContextValue {
  const value = use(UnitContext);
  if (!value) throw new Error("useUnit must be used inside <UnitProvider>");
  return value;
}

/** A link to the builder that opens it on the given unit's tab. */
export function SelectUnitLink({
  unit,
  className,
  children,
}: {
  unit: UnitId;
  className?: string;
  children: ReactNode;
}) {
  const { setUnit } = useUnit();
  return (
    <a href="#builder" className={className} onClick={() => setUnit(unit)}>
      {children}
    </a>
  );
}
