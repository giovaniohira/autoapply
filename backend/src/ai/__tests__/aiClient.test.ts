import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateAnswer } from "../aiClient.js";

const validResponse = {
	choices: [{ message: { content: "Generated answer text." } }],
};

describe("generateAnswer", () => {
	const originalFetch = globalThis.fetch;
	const originalEnv = process.env;

	beforeEach(() => {
		process.env["OPENAI_API_KEY"] = "test-key";
		process.env["OPENAI_BASE_URL"] = undefined;
		process.env["OPENAI_MODEL"] = undefined;
	});

	afterEach(() => {
		process.env = originalEnv;
		globalThis.fetch = originalFetch;
		vi.restoreAllMocks();
	});

	it("throws when OPENAI_API_KEY is not set", async () => {
		delete process.env["OPENAI_API_KEY"];
		await expect(
			generateAnswer({
				resumeOrProfile: "Profile",
				jobDescription: "Job",
				question: "Why us?",
			}),
		).rejects.toThrow("OPENAI_API_KEY");
	});

	it("returns content when API returns valid response", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(validResponse),
			}),
		);
		const result = await generateAnswer({
			resumeOrProfile: "Profile",
			jobDescription: "Job",
			question: "Why us?",
		});
		expect(result).toBe("Generated answer text.");
	});

	it("throws when API returns non-OK status", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				text: () => Promise.resolve("Internal Server Error"),
			}),
		);
		await expect(
			generateAnswer({
				resumeOrProfile: "P",
				jobDescription: "J",
				question: "Q",
			}),
		).rejects.toThrow("AI API error 500");
	});

	it("throws when API returns empty content", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({ choices: [{ message: { content: "" } }] }),
			}),
		);
		await expect(
			generateAnswer({
				resumeOrProfile: "P",
				jobDescription: "J",
				question: "Q",
			}),
		).rejects.toThrow("AI API returned empty response");
	});

	it("uses OPENAI_BASE_URL when set", async () => {
		process.env["OPENAI_BASE_URL"] = "https://custom.api/v1";
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve(validResponse),
		});
		vi.stubGlobal("fetch", fetchMock);
		await generateAnswer({
			resumeOrProfile: "P",
			jobDescription: "J",
			question: "Q",
		});
		expect(fetchMock).toHaveBeenCalledWith(
			expect.stringContaining("https://custom.api/v1"),
			expect.any(Object),
		);
	});
});
