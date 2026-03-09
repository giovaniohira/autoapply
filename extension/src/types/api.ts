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

/** User profile for autofill (from GET /users/:id). */
export interface AutofillProfile {
	name: string;
	email: string;
	phone: string | null;
	location: string | null;
	yearsExperience: number;
}

/** Response from POST /apply (backend apply-job orchestration). */
export interface ApplyJobResponse {
	jobApplicationId: string;
	score: number;
	status: "READY_FOR_EXTENSION" | "SKIPPED_LOW_SCORE";
	answers?: Array<{ question: string; answer: string }>;
}
