/**
 * DOM abstraction for LinkedIn Jobs.
 * Centralises selectors; update when LinkedIn changes DOM.
 * Uses fallbacks and retry with backoff when elements are missing.
 */

/** Delay in ms between retries */
const RETRY_DELAY_MS = 300;
const MAX_RETRIES = 5;

/**
 * Run a query with retries and optional backoff.
 */
export async function queryWithRetry<T>(
	query: () => T | null,
	retries = MAX_RETRIES,
): Promise<T | null> {
	for (let i = 0; i < retries; i++) {
		const result = query();
		if (result != null) return result;
		await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (i + 1)));
	}
	return null;
}

// --- Listing page (search results) ---

/** Selectors for job cards on the jobs search/listing page */
const LISTING_SELECTORS = {
	/** Container of job cards (scopes the list) */
	jobListContainer:
		".scaffold-layout__list-container, .jobs-search-results-list, [data-job-id]",
	/** Individual job card / row (clickable item) */
	jobCard:
		".job-card-container, .jobs-search-results__list-item, li[data-occludable-job-id], [data-job-id]",
	/** Link to job view page */
	jobCardLink:
		"a.job-card-list__title, a[href*='/jobs/view/'], .job-card-container a[href*='/jobs/view/']",
	/** Company name in card */
	companyName:
		".job-card-container__company-name, .artdeco-entity-lockup__subtitle, [data-test-job-card-company]",
	/** Job title in card */
	jobTitle:
		".job-card-list__title, .artdeco-entity-lockup__title, [data-test-job-card-title]",
} as const;

/**
 * Get all job cards on the current listing page.
 */
export function getJobCards(): Element[] {
	const container = document.querySelector(LISTING_SELECTORS.jobListContainer);
	const root = container ?? document.body;
	const cards = root.querySelectorAll(LISTING_SELECTORS.jobCard);
	return Array.from(cards);
}

/**
 * Get the job view URL from a job card element.
 */
export function getJobLinkFromCard(card: Element): string | null {
	const link =
		card.querySelector<HTMLAnchorElement>(LISTING_SELECTORS.jobCardLink) ??
		card.closest("a") ??
		(card.querySelector("a[href*='/jobs/view/']") as HTMLAnchorElement | null);
	return link?.href ?? null;
}

/**
 * Get company name text from a job card.
 */
export function getCompanyFromCard(card: Element): string | null {
	const el =
		card.querySelector(LISTING_SELECTORS.companyName) ??
		card.querySelector(".job-card-container__company-name");
	return el?.textContent?.trim() ?? null;
}

/**
 * Get job title text from a job card.
 */
export function getJobTitleFromCard(card: Element): string | null {
	const el =
		card.querySelector(LISTING_SELECTORS.jobTitle) ??
		card.querySelector(".job-card-list__title");
	return el?.textContent?.trim() ?? null;
}

// --- Job view page (single job) ---

/** Selectors for the single job view page */
const JOB_VIEW_SELECTORS = {
	/** Main description container */
	descriptionContainer:
		".jobs-box__html-content, .jobs-description__content, .show-more-less-html",
	/** Job title (h1) */
	title: "h1.top-card-layout__title, h1.t-24, .job-details-jobs-unified-top-card__job-title",
	/** Company name */
	company:
		".top-card-layout__card .topcard__flavor, .job-details-jobs-unified-top-card__company-name, .top-card-layout__second-subline",
	/** Criteria / requirements section (years, etc.) */
	criteria:
		".job-details-jobs-unified-description__job-criteria-list, .jobs-unified-top-card__job-insight",
	/** Full text of description (for parsing technologies, etc.) */
	descriptionBody: ".jobs-description__content, .jobs-box__html-content",
} as const;

/**
 * Get the main job description container on the job view page.
 */
export function getJobDescriptionContainer(): Element | null {
	return document.querySelector(JOB_VIEW_SELECTORS.descriptionContainer);
}

/**
 * Get full job description text (for parsing requirements, tech, etc.).
 */
export function getJobDescriptionText(): string | null {
	const container =
		document.querySelector(JOB_VIEW_SELECTORS.descriptionBody) ??
		document.querySelector(JOB_VIEW_SELECTORS.descriptionContainer);
	if (!container) return null;
	return container.textContent?.trim() ?? null;
}

/**
 * Get job title on the job view page.
 */
export function getJobViewTitle(): string | null {
	const el = document.querySelector(JOB_VIEW_SELECTORS.title);
	return el?.textContent?.trim() ?? null;
}

/**
 * Get company name on the job view page.
 */
export function getJobViewCompany(): string | null {
	const el = document.querySelector(JOB_VIEW_SELECTORS.company);
	return el?.textContent?.trim() ?? null;
}

/**
 * Get job criteria list container (years of experience, employment type, etc.).
 */
export function getJobCriteriaContainer(): Element | null {
	return document.querySelector(JOB_VIEW_SELECTORS.criteria);
}

/**
 * Get current page job view URL (if on a job view page).
 */
export function getCurrentJobViewUrl(url?: string): string | null {
	const href = url ?? (typeof window !== "undefined" ? window.location.href : "");
	const match = href.match(/^https:\/\/www\.linkedin\.com\/jobs\/view\/[^/?#]+/);
	return match ? match[0] : null;
}

/**
 * Check if current page is a job listing (search) page.
 */
export function isListingPage(url?: string): boolean {
	const href = url ?? (typeof window !== "undefined" ? window.location.href : "");
	return /^https:\/\/www\.linkedin\.com\/jobs\/search/.test(href);
}

/**
 * Check if current page is a single job view page.
 */
export function isJobViewPage(url?: string): boolean {
	const href = url ?? (typeof window !== "undefined" ? window.location.href : "");
	return /^https:\/\/www\.linkedin\.com\/jobs\/view\//.test(href);
}
