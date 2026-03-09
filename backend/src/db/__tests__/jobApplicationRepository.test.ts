import { beforeAll, describe, expect, it } from "vitest";
import { runMigrations } from "../migrate";
import { userRepository } from "../userRepository";
import { jobApplicationRepository } from "../jobApplicationRepository";

beforeAll(async () => {
	runMigrations();
	await userRepository.create({
		id: "u1",
		name: "Test User",
		email: "test@example.com",
		yearsExperience: 3,
	});
});

describe("jobApplicationRepository", () => {
	it("creates and finds job application by id", async () => {
		const created = await jobApplicationRepository.create({
			id: "ja-1",
			userId: "u1",
			company: "Acme",
			role: "Software Engineer",
			jobLink: "https://linkedin.com/jobs/1",
			compatibilityScore: 75,
			status: "PENDING_DECISION",
		});
		expect(created.company).toBe("Acme");
		expect(created.status).toBe("PENDING_DECISION");

		const found = await jobApplicationRepository.findById("ja-1");
		expect(found?.jobLink).toBe("https://linkedin.com/jobs/1");
	});

	it("finds by user and job link", async () => {
		const found = await jobApplicationRepository.findByUserAndJobLink(
			"u1",
			"https://linkedin.com/jobs/1",
		);
		expect(found).not.toBeNull();
		expect(found?.id).toBe("ja-1");
	});

	it("finds by user with optional limit and status", async () => {
		await jobApplicationRepository.create({
			id: "ja-2",
			userId: "u1",
			company: "Beta",
			role: "Backend",
			jobLink: "https://linkedin.com/jobs/2",
			compatibilityScore: 50,
			status: "SKIPPED_LOW_SCORE",
		});
		const all = await jobApplicationRepository.findByUser("u1");
		expect(all.length).toBeGreaterThanOrEqual(2);
		const limited = await jobApplicationRepository.findByUser("u1", {
			limit: 1,
		});
		expect(limited).toHaveLength(1);
		const skipped = await jobApplicationRepository.findByUser("u1", {
			status: "SKIPPED_LOW_SCORE",
		});
		expect(skipped.every((a) => a.status === "SKIPPED_LOW_SCORE")).toBe(true);
	});

	it("updates status and appliedAt", async () => {
		const updated = await jobApplicationRepository.update("ja-1", {
			status: "APPLIED",
			appliedAt: new Date("2025-01-15"),
		});
		expect(updated?.status).toBe("APPLIED");
		expect(updated?.appliedAt).toEqual(new Date("2025-01-15"));
	});
});
