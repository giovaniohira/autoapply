/**
 * E2E: Dummy LinkedIn Jobs page fixture.
 * Verifies the test page has the DOM structure the extension expects
 * (job cards, links, company names) so critical-path E2E can be extended
 * to load the extension and run scoring/autofill against this env.
 */
import { pathToFileURL } from "node:url";
import { join } from "node:path";
import { test, expect } from "@playwright/test";

const fixturePath = join(process.cwd(), "e2e", "fixtures", "dummy-job-page.html");
const fixtureUrl = pathToFileURL(fixturePath).href;

test.describe("Dummy job page (extension fixture)", () => {
	test("page has job list container and job cards", async ({ page }) => {
		await page.goto(fixtureUrl);
		const container = page.getByTestId("job-list-container");
		await expect(container).toBeVisible();
		const cards = page.getByTestId("job-card");
		await expect(cards).toHaveCount(2);
	});

	test("job cards have link, title and company (extension selectors)", async ({ page }) => {
		await page.goto(fixtureUrl);
		const firstCard = page.getByTestId("job-card").first();
		await expect(firstCard.locator("a[href*='/jobs/view/']")).toHaveAttribute(
			"href",
			/\/jobs\/view\/\d+/,
		);
		await expect(firstCard.getByTestId("job-card-company")).toHaveText("Acme Corp");
		await expect(firstCard.locator("a.job-card-list__title")).toHaveText("Software Engineer");
	});
});
