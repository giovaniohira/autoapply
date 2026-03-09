/**
 * Internal extension messaging: content scripts ↔ background.
 */

import type { AutofillProfile, JobPayload } from "./api.js";

/** From content script: a job was found (listing or job page). */
export interface MessageJobFound {
	type: "AUTOAPPLY_JOB_FOUND";
	payload: JobPayload;
	source: "listing" | "job-page";
}

/** From content script: application form is open; request autofill data. */
export interface MessageApplicationFormOpen {
	type: "AUTOAPPLY_APPLICATION_FORM_OPEN";
	jobLink: string;
	job: JobPayload;
	/** Open-ended question texts (from form labels/placeholders) for AI answers. */
	questions: string[];
}

/** From content script: report missing required fields for an application (backend logging). */
export interface MessageReportMissingFields {
	type: "AUTOAPPLY_REPORT_MISSING_FIELDS";
	jobApplicationId: string;
	missingFields: string[];
}

/** From background to content: score result and decision. */
export interface MessageScoreResult {
	type: "AUTOAPPLY_SCORE_RESULT";
	score: number;
	aboveThreshold: boolean;
	jobApplicationId?: string;
	error?: string;
}

/** From background to content: autofill data (profile + AI answers) or error. */
export interface MessageAutofillData {
	type: "AUTOAPPLY_AUTOFILL_DATA";
	profile: AutofillProfile | null;
	answers: Array<{ question: string; answer: string }>;
	jobApplicationId: string | null;
	error?: string;
}

export type ContentToBackgroundMessage =
	| MessageJobFound
	| MessageApplicationFormOpen
	| MessageReportMissingFields;
export type BackgroundToContentMessage = MessageScoreResult | MessageAutofillData;
