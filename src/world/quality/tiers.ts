export type QualityTier = "low" | "medium" | "high" | "ultra";
export const qualityTiers = {
  low: { dpr: 1, shadows: 1024, trees: 8, clouds: 3, post: false },
  medium: { dpr: 1.25, shadows: 1024, trees: 14, clouds: 5, post: true },
  high: { dpr: 1.5, shadows: 2048, trees: 22, clouds: 7, post: true },
  ultra: { dpr: 2, shadows: 4096, trees: 32, clouds: 9, post: true },
} as const;
export function autoQuality(width: number, touch: boolean): QualityTier {
  return touch || width < 768 ? "low" : width < 1400 ? "medium" : "high";
}
