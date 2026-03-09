/**
 * Compatibility algorithm weights (PRD).
 * Sum must be 100.
 */
export const COMPATIBILITY_WEIGHTS = {
	experience: 40,
	technology: 30,
	role: 15,
	location: 10,
	additional: 5,
} as const;

/** Default threshold: apply only when score >= 60. */
export const DEFAULT_COMPATIBILITY_THRESHOLD = 60;
