import { describe, expect, it } from "vitest";
import { randomDelay } from "./autofill.js";

describe("autofill", () => {
	it("randomDelay resolves after a delay within given range", async () => {
		const start = Date.now();
		await randomDelay(10, 30);
		const elapsed = Date.now() - start;
		expect(elapsed).toBeGreaterThanOrEqual(10);
	});
});
