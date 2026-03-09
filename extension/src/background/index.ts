/**
 * Background service worker: message listener and backend orchestration.
 */

import type { JobPayload } from "../types/api.js";
import type {
	BackgroundToContentMessage,
	ContentToBackgroundMessage,
	MessageScoreResult,
} from "../types/messages.js";
import { logger } from "../logger.js";
import { applyJob, getProfile, reportMissingFields, scoreJob } from "./apiClient.js";
import { DEFAULTS, STORAGE_KEYS } from "./storage.js";

chrome.runtime.onMessage.addListener(
	(
		message: ContentToBackgroundMessage,
		sender: chrome.runtime.MessageSender,
		sendResponse: (response?: BackgroundToContentMessage) => void,
	) => {
		if (message.type === "AUTOAPPLY_JOB_FOUND") {
			handleJobFound(message.payload, sender.tab?.id ?? null)
				.then(sendResponse)
				.catch((err) => {
					const errorMsg = err instanceof Error ? err.message : String(err);
					logger.warn("Job score failed", { error: errorMsg, jobLink: message.payload?.jobLink });
					sendResponse({
						type: "AUTOAPPLY_SCORE_RESULT",
						score: 0,
						aboveThreshold: false,
						error: errorMsg,
					});
				});
			return true;
		}
		if (message.type === "AUTOAPPLY_APPLICATION_FORM_OPEN") {
			handleApplicationFormOpen(message, sender.tab?.id ?? null)
				.then(sendResponse)
				.catch((err) => {
					const errorMsg = err instanceof Error ? err.message : String(err);
					logger.warn("Application form / autofill failed", { error: errorMsg, jobLink: message.jobLink });
					sendResponse({
						type: "AUTOAPPLY_AUTOFILL_DATA",
						profile: null,
						answers: [],
						jobApplicationId: null,
						error: errorMsg,
					});
				});
			return true;
		}
		if (message.type === "AUTOAPPLY_REPORT_MISSING_FIELDS") {
			reportMissingFields(message.jobApplicationId, message.missingFields).catch(() => {});
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

async function isAutomationEnabled(): Promise<boolean> {
	const out = await chrome.storage.local.get(STORAGE_KEYS.AUTOMATION_ENABLED);
	return out[STORAGE_KEYS.AUTOMATION_ENABLED] !== false;
}

async function checkRateLimit(): Promise<{ allowed: boolean }> {
	const out = await chrome.storage.local.get(STORAGE_KEYS.APPLY_TIMESTAMPS);
	const raw = out[STORAGE_KEYS.APPLY_TIMESTAMPS];
	const timestamps: string[] = Array.isArray(raw) ? raw : [];
	const now = Date.now();
	const windowStart = now - DEFAULTS.RATE_LIMIT_WINDOW_MS;
	const recent = timestamps.filter((t) => new Date(t).getTime() > windowStart);
	if (recent.length >= DEFAULTS.RATE_LIMIT_COUNT) {
		return { allowed: false };
	}
	recent.push(new Date().toISOString());
	await chrome.storage.local.set({ [STORAGE_KEYS.APPLY_TIMESTAMPS]: recent });
	return { allowed: true };
}

async function handleApplicationFormOpen(
	message: ContentToBackgroundMessage & { type: "AUTOAPPLY_APPLICATION_FORM_OPEN" },
	tabId: number | null,
): Promise<BackgroundToContentMessage> {
	const enabled = await isAutomationEnabled();
	if (!enabled) {
		return {
			type: "AUTOAPPLY_AUTOFILL_DATA",
			profile: null,
			answers: [],
			jobApplicationId: null,
			error: "Automation is disabled. Enable it in the extension popup.",
		};
	}

	const { allowed } = await checkRateLimit();
	if (!allowed) {
		return {
			type: "AUTOAPPLY_AUTOFILL_DATA",
			profile: null,
			answers: [],
			jobApplicationId: null,
			error: `Rate limit reached (max ${DEFAULTS.RATE_LIMIT_COUNT} applications per hour).`,
		};
	}

	const userId = (await chrome.storage.local.get(STORAGE_KEYS.USER_ID))[STORAGE_KEYS.USER_ID] as
		| string
		| undefined;
	if (!userId) {
		return {
			type: "AUTOAPPLY_AUTOFILL_DATA",
			profile: null,
			answers: [],
			jobApplicationId: null,
			error: "User not configured. Set User ID in extension options.",
		};
	}

	const threshold =
		(await chrome.storage.local.get(STORAGE_KEYS.DEFAULT_THRESHOLD))[
			STORAGE_KEYS.DEFAULT_THRESHOLD
		] as number | undefined;

	const [profileResult, applyResult] = await Promise.all([
		getProfile(userId),
		applyJob(userId, message.job, {
			threshold: threshold ?? DEFAULTS.DEFAULT_THRESHOLD,
			questions: message.questions ?? [],
		}),
	]);

	if ("error" in profileResult) {
		return {
			type: "AUTOAPPLY_AUTOFILL_DATA",
			profile: null,
			answers: [],
			jobApplicationId: null,
			error: profileResult.error,
		};
	}

	if ("error" in applyResult) {
		return {
			type: "AUTOAPPLY_AUTOFILL_DATA",
			profile: profileResult.data,
			answers: [],
			jobApplicationId: null,
			error: applyResult.error,
		};
	}

	const { data: applyData } = applyResult;
	const payload: BackgroundToContentMessage = {
		type: "AUTOAPPLY_AUTOFILL_DATA",
		profile: profileResult.data,
		answers: applyData.answers ?? [],
		jobApplicationId: applyData.jobApplicationId ?? null,
	};

	if (tabId != null) {
		chrome.tabs.sendMessage(tabId, payload).catch(() => {});
	}

	return payload;
}
