/**
 * Build JobPayload from the current LinkedIn job view page using DOM and parsing.
 */

import type { JobPayload } from "../../types/api.js";
import {
	getCurrentJobViewUrl,
	getJobDescriptionText,
	getJobViewTitle,
	getJobViewCompany,
	getJobCriteriaContainer,
} from "./selectors.js";
import { parseYearsExperience, parseTechnologies } from "./parseDescription.js";

/**
 * Scrape the current job view page into a JobPayload.
 * Uses DOM abstraction and fallbacks; returns null if essential data is missing.
 */
export function scrapeJobViewPage(): JobPayload | null {
	const jobLink = getCurrentJobViewUrl();
	const title = getJobViewTitle();
	const company = getJobViewCompany();
	const descriptionText = getJobDescriptionText();

	if (!jobLink || !title) return null;

	const payload: JobPayload = {
		company: company ?? "Unknown",
		role: title,
		jobLink,
	};

	const years = descriptionText
		? parseYearsExperience(descriptionText)
		: parseYearsFromCriteria(getJobCriteriaContainer());
	if (years != null) payload.requiredYearsExperience = years;

	if (descriptionText) {
		const techs = parseTechnologies(descriptionText);
		if (techs.length > 0) payload.technologies = techs;
	}

	return payload;
}

/**
 * Try to parse years from the criteria list DOM (e.g. "X years of experience").
 */
function parseYearsFromCriteria(container: Element | null): number | undefined {
	if (!container) return undefined;
	const text = container.textContent ?? "";
	return parseYearsExperience(text);
}
