/**
 * Internal extension messaging: content scripts ↔ background.
 */

import type { JobPayload } from "./api.js";

/** From content script: a job was found (listing or job page). */
export interface MessageJobFound {
	type: "AUTOAPPLY_JOB_FOUND";
	payload: JobPayload;
	source: "listing" | "job-page";
}

/** From content script: application form is open. */
export interface MessageApplicationFormOpen {
	type: "AUTOAPPLY_APPLICATION_FORM_OPEN";
	jobLink: string;
}

/** From background to content: score result and decision. */
export interface MessageScoreResult {
	type: "AUTOAPPLY_SCORE_RESULT";
	score: number;
	aboveThreshold: boolean;
	jobApplicationId?: string;
	error?: string;
}

export type ContentToBackgroundMessage = MessageJobFound | MessageApplicationFormOpen;
export type BackgroundToContentMessage = MessageScoreResult;
