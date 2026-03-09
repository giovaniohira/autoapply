/**
 * Build minimal JobPayload from a job card on the listing page.
 */

import type { JobPayload } from "../../types/api.js";
import {
	getJobLinkFromCard,
	getCompanyFromCard,
	getJobTitleFromCard,
} from "./selectors.js";

/**
 * Scrape one job card element into a minimal JobPayload (link, company, role).
 * Full details are scraped on the job view page.
 */
export function scrapeJobCard(card: Element): JobPayload | null {
	const jobLink = getJobLinkFromCard(card);
	const company = getCompanyFromCard(card);
	const role = getJobTitleFromCard(card);

	if (!jobLink) return null;

	return {
		jobLink,
		company: company ?? "Unknown",
		role: role ?? "Unknown",
	};
}
