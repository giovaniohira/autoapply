/**
 * Background service worker: message listener and backend orchestration.
 */

import type { JobPayload } from "../types/api.js";
import type { ContentToBackgroundMessage, MessageScoreResult } from "../types/messages.js";
import { scoreJob } from "./apiClient.js";
import { DEFAULTS } from "./storage.js";

chrome.runtime.onMessage.addListener(
	(
		message: ContentToBackgroundMessage,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response?: MessageScoreResult) => void,
	) => {
		if (message.type === "AUTOAPPLY_JOB_FOUND") {
			handleJobFound(message.payload, sender.tab?.id ?? null)
				.then(sendResponse)
				.catch((err) => {
					sendResponse({
						type: "AUTOAPPLY_SCORE_RESULT",
						score: 0,
						aboveThreshold: false,
						error: err instanceof Error ? err.message : String(err),
					});
				});
			return true; // keep channel open for async sendResponse
		}
		if (message.type === "AUTOAPPLY_APPLICATION_FORM_OPEN") {
			// Future: trigger autofill flow; for now just acknowledge
			sendResponse({
				type: "AUTOAPPLY_SCORE_RESULT",
				score: 0,
				aboveThreshold: false,
			});
			return false;
		}
		return false;
	},
);

async function handleJobFound(payload: JobPayload, tabId: number | null): Promise<MessageScoreResult> {
	const result = await scoreJob(payload, {
		persist: true,
		threshold: DEFAULTS.DEFAULT_THRESHOLD,
	});

	if ("error" in result) {
		return {
			type: "AUTOAPPLY_SCORE_RESULT",
			score: 0,
			aboveThreshold: false,
			error: result.error,
		};
	}

	const { data } = result;
	const aboveThreshold = data.score >= DEFAULTS.DEFAULT_THRESHOLD;

	if (tabId != null) {
		// Optionally notify content script of score (e.g. to show badge or UI)
		chrome.tabs.sendMessage(tabId, {
			type: "AUTOAPPLY_SCORE_RESULT",
			score: data.score,
			aboveThreshold,
			jobApplicationId: data.jobApplicationId,
		} satisfies MessageScoreResult).catch(() => {
			// Tab or content script may not be listening
		});
	}

	return {
		type: "AUTOAPPLY_SCORE_RESULT",
		score: data.score,
		aboveThreshold,
		jobApplicationId: data.jobApplicationId,
	};
}
