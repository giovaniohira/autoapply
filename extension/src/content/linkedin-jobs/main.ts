/**
 * LinkedIn Jobs content script entry.
 * Runs on both listing and job view pages; dispatches to listing or job-page logic
 * and sends messages to the background script.
 */

import { isJobViewPage, isListingPage, getJobCards } from "./selectors.js";
import { scrapeJobViewPage } from "./scrapeJobPage.js";
import { scrapeJobCard } from "./scrapeListing.js";
import type { ContentToBackgroundMessage } from "../../types/messages.js";

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
 * Notify background that the application form is open (for future autofill).
 */
export function notifyApplicationFormOpen(jobLink: string): void {
	sendToBackground({
		type: "AUTOAPPLY_APPLICATION_FORM_OPEN",
		jobLink,
	});
}

function main(): void {
	if (isJobViewPage()) {
		// Small delay so DOM is ready
		setTimeout(runOnJobViewPage, 500);
	} else if (isListingPage()) {
		setTimeout(runOnListingPage, 1000);
	}
}

main();
