/**
 * Compatibility score result (0–100) with optional per-criterion breakdown.
 */
export interface CompatibilityScore {
	score: number;
	breakdown?: CompatibilityBreakdown;
}

export interface CompatibilityBreakdown {
	experience: number;
	technology: number;
	role: number;
	location: number;
	additional: number;
}

/**
 * Role categories for role-match scoring (Backend, Full Stack, etc.).
 */
export type RoleType =
	| "BACKEND"
	| "FRONTEND"
	| "FULL_STACK"
	| "SOFTWARE_ENGINEER"
	| "DEVOPS"
	| "DATA"
	| "MOBILE"
	| "OTHER";

/**
 * Location preference for filtering and scoring.
 */
export interface LocationPreference {
	remote?: boolean;
	country?: string;
	city?: string;
}

/**
 * Job data as received from extension (e.g. LinkedIn scrape).
 */
export interface JobPayload {
	company: string;
	role: string;
	jobLink: string;
	requiredYearsExperience?: number;
	technologies?: string[];
	roleType?: RoleType;
	location?: LocationPreference;
	additionalRequirements?: string[];
}
