/**
 * Job data as scraped from LinkedIn (matches backend JobPayload).
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

export type RoleType =
	| "BACKEND"
	| "FRONTEND"
	| "FULL_STACK"
	| "SOFTWARE_ENGINEER"
	| "DEVOPS"
	| "DATA"
	| "MOBILE"
	| "OTHER";

export interface LocationPreference {
	remote?: boolean;
	country?: string;
	city?: string;
}

/** Request body for POST /compatibility/score */
export interface ScoreJobRequest {
	userId: string;
	job: JobPayload;
	includeBreakdown?: boolean;
	persist?: boolean;
	threshold?: number;
}

/** Response from POST /compatibility/score */
export interface ScoreJobResponse {
	score: number;
	breakdown?: {
		experience: number;
		technology: number;
		role: number;
		location: number;
		additional: number;
	};
	jobApplicationId?: string;
}
