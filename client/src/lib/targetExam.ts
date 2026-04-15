export const TARGET_EXAM_OPTIONS = [
  "UPSC CSE",
  "TSPSC Group 1",
  "TSPSC Group 2",
  "APPSC Group 1",
  "SSC CGL",
  "SSC CHSL",
  "RRB NTPC",
  "IBPS PO",
] as const;

export const DEFAULT_TARGET_EXAM = TARGET_EXAM_OPTIONS[0];

export function normalizeTargetExam(value?: string | null) {
  if (!value) return DEFAULT_TARGET_EXAM;

  return value.replace(/\s+20\d{2}$/, "").trim() || DEFAULT_TARGET_EXAM;
}
