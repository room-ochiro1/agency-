import type { UnitId } from "@/lib/catalog";

// Positions are fractions of the canvas: x and y run from -0.5 to 0.5 (y up), centred.
// On the z = 0 plane the camera maps them linearly to the screen, so the DOM labels
// can sit on the same lines with plain CSS percentages.

export const WIDE_QUERY = "(min-width: 900px)";

export type Point = { x: number; y: number };

export type PrismLayout = {
  prism: Point;
  /** Where the white beam enters, off the left edge. */
  source: Point;
  /** Where the coloured beams end, off the right edge. */
  exitX: number;
  /** x of each label's right end; the label sits just above its beam there. */
  labelX: number;
  /** Prism radius as a fraction of the canvas height and width; the smaller wins. */
  radius: { ofHeight: number; ofWidth: number };
};

export const layouts: Record<"wide" | "narrow", PrismLayout> = {
  wide: {
    // The white beam rises from below the fold, clear of the copy column on the left.
    prism: { x: 0.21, y: -0.03 },
    source: { x: 0.02, y: -0.62 },
    exitX: 0.58,
    labelX: 0.47,
    radius: { ofHeight: 0.15, ofWidth: 0.1 },
  },
  narrow: {
    // Sits high in its block so the prism already shows on the first phone screen.
    prism: { x: -0.04, y: 0.12 },
    source: { x: -0.62, y: -0.16 },
    exitX: 0.62,
    labelX: 0.46,
    radius: { ofHeight: 0.2, ofWidth: 0.21 },
  },
};

export type Beam = { unit: UnitId; label: string; color: string; slope: number };

// Spectral order: the prism bends violet the most and orange the least.
// Colours match --color-growth / --color-studios / --color-entertainment in globals.css.
export const beams: Beam[] = [
  { unit: "entertainment", label: "Entertainment", color: "#ff946e", slope: 0.38 },
  { unit: "growth", label: "Growth", color: "#c6ff3d", slope: 0.1 },
  { unit: "studios", label: "Studios", color: "#a99aff", slope: -0.18 },
];

export function beamYAt(layout: PrismLayout, beam: Beam, x: number): number {
  return layout.prism.y + (x - layout.prism.x) * beam.slope;
}
