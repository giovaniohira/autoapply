/**
 * Job application record — one per user + job pair.
 */
export type JobApplicationStatus =
	| "PENDING_DECISION"
	| "READY_FOR_EXTENSION"
	| "APPLIED"
	| "SKIPPED_LOW_SCORE"
	| "FAILED"
	| "INCOMPLETE";

export interface JobApplication {
	id: string;
	userId: string;
	company: string;
	role: string;
	jobLink: string;
	compatibilityScore: number;
	status: JobApplicationStatus;
	appliedAt: Date | null;
	failureReason: string | null;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * AI-generated or manual answer for an application question.
 */
export interface ApplicationAnswer {
	id: string;
	jobApplicationId: string;
	question: string;
	answer: string;
	createdAt: Date;
	updatedAt: Date;
}
