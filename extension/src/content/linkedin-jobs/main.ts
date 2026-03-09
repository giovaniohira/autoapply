/**
 * LinkedIn Jobs content script entry.
 * Runs on both listing and job view pages; dispatches to listing or job-page logic,
 * detects Easy Apply modal and triggers autofill flow.
 */

import { isJobViewPage, isListingPage, getJobCards, getEasyApplyModal } from "./selectors.js";
import { scrapeJobViewPage } from "./scrapeJobPage.js";
import { scrapeJobCard } from "./scrapeListing.js";
import { getFormQuestions, runAutofill } from "./autofill.js";
import type { ContentToBackgroundMessage, MessageAutofillData } from "../../types/messages.js";
import type { JobPayload } from "../../types/api.js";

function sendToBackground(message: ContentToBackgroundMessage): void {
	chrome.runtime.sendMessage(message).catch(() => {
		// Extension context invalidated or background not listening
	});
}

/**
 * On listing page: scrape visible job cards and report first batch to background.
 * In MVP we only send one "job found" per card we're interested in (e.g. first card)
 * or we could send all; for now we send each card as job found so background can score.
 */
function runOnListingPage(): void {
	const cards = getJobCards();
	for (const card of cards) {
		const payload = scrapeJobCard(card);
		if (payload) {
			sendToBackground({
				type: "AUTOAPPLY_JOB_FOUND",
				payload,
				source: "listing",
			});
		}
	}
}

/**
 * On job view page: scrape full job details and send to background for scoring.
 */
function runOnJobViewPage(): void {
	const payload = scrapeJobViewPage();
	if (payload) {
		sendToBackground({
			type: "AUTOAPPLY_JOB_FOUND",
			payload,
			source: "job-page",
		});
	}
}

/**
 * Request autofill data from background (profile + AI answers) and run autofill when form is open.
 */
function requestAutofillData(job: JobPayload, questions: string[]): void {
	sendToBackground({
		type: "AUTOAPPLY_APPLICATION_FORM_OPEN",
		jobLink: job.jobLink,
		job,
		questions,
	});
}

/** Whether we already requested autofill for the current modal (avoid duplicate requests). */
let autofillRequestedForCurrentModal = false;

function onAutofillDataReceived(message: MessageAutofillData): void {
	autofillRequestedForCurrentModal = false;
	if (message.error) return;
	runAutofill(message.profile ?? null, message.answers ?? []).then((result) => {
		if (result.missing.length > 0) {
			console.warn("[AutoApply] Missing fields (not filled):", result.missing);
			if (message.jobApplicationId) {
				sendToBackground({
					type: "AUTOAPPLY_REPORT_MISSING_FIELDS",
					jobApplicationId: message.jobApplicationId,
					missingFields: result.missing,
				});
			}
		}
	});
}

function main(): void {
	if (isJobViewPage()) {
		setTimeout(runOnJobViewPage, 500);
		// Watch for Easy Apply modal: trigger autofill when it appears; reset flag when it closes
		const observer = new MutationObserver(() => {
			const modal = getEasyApplyModal();
			if (!modal) {
				autofillRequestedForCurrentModal = false;
				return;
			}
			if (autofillRequestedForCurrentModal) return;
			const job = scrapeJobViewPage();
			if (!job) return;
			setTimeout(() => {
				const questions = getFormQuestions();
				autofillRequestedForCurrentModal = true;
				requestAutofillData(job, questions);
			}, 300);
		});
		observer.observe(document.body, { childList: true, subtree: true });
	} else if (isListingPage()) {
		setTimeout(runOnListingPage, 1000);
	}

	chrome.runtime.onMessage.addListener(
		(message: unknown): void => {
			if (message && typeof message === "object" && "type" in message && message.type === "AUTOAPPLY_AUTOFILL_DATA") {
				onAutofillDataReceived(message as MessageAutofillData);
			}
		},
	);
}

main();
