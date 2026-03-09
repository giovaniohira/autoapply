import { describe, expect, it } from "vitest";
import {
	isListingPage,
	isJobViewPage,
	getCurrentJobViewUrl,
	getJobLinkFromCard,
	getCompanyFromCard,
	getJobTitleFromCard,
} from "./selectors";

describe("selectors (URL helpers)", () => {
	it("isListingPage returns true for jobs search URL", () => {
		expect(isListingPage("https://www.linkedin.com/jobs/search/")).toBe(true);
		expect(isListingPage("https://www.linkedin.com/jobs/search?keywords=dev")).toBe(true);
	});

	it("isListingPage returns false for job view URL", () => {
		expect(isListingPage("https://www.linkedin.com/jobs/view/123")).toBe(false);
	});

	it("isJobViewPage returns true for job view URL", () => {
		expect(isJobViewPage("https://www.linkedin.com/jobs/view/abc-123")).toBe(true);
	});

	it("isJobViewPage returns false for search URL", () => {
		expect(isJobViewPage("https://www.linkedin.com/jobs/search/")).toBe(false);
	});

	it("getCurrentJobViewUrl returns match for view URL", () => {
		const url = "https://www.linkedin.com/jobs/view/receptionist-at-kodiak-4228584755";
		expect(getCurrentJobViewUrl(url)).toBe(url);
	});

	it("getCurrentJobViewUrl returns null for search URL", () => {
		expect(getCurrentJobViewUrl("https://www.linkedin.com/jobs/search/")).toBe(null);
	});
});

describe("selectors (DOM helpers)", () => {
	it("getJobLinkFromCard returns null when card has no link", () => {
		const card = { querySelector: () => null, closest: () => null } as unknown as Element;
		expect(getJobLinkFromCard(card)).toBe(null);
	});

	it("getCompanyFromCard returns null when no company element", () => {
		const card = { querySelector: () => null } as unknown as Element;
		expect(getCompanyFromCard(card)).toBe(null);
	});

	it("getJobTitleFromCard returns null when no title element", () => {
		const card = { querySelector: () => null } as unknown as Element;
		expect(getJobTitleFromCard(card)).toBe(null);
	});
});
