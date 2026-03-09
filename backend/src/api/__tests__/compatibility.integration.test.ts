import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { runMigrations } from "../../db/migrate";
import { userRepository } from "../../db/userRepository";
import { jobApplicationRepository } from "../../db/jobApplicationRepository";
import { createApp } from "../../app";

beforeAll(() => {
	runMigrations();
});

describe("POST /compatibility/score", () => {
	beforeAll(async () => {
		await userRepository.create({
			id: "score-test-user",
			name: "Score User",
			email: "score@example.com",
			yearsExperience: 4,
		});
		await userRepository.addSkill({
			id: "skill-ts",
			userId: "score-test-user",
			skill: "TypeScript",
			yearsExperience: 2,
		});
	});

	it("returns 400 for invalid body", async () => {
		const app = createApp();
		const res = await request(app)
			.post("/compatibility/score")
			.send({});
		expect(res.status).toBe(400);
	});

	it("returns 404 for unknown userId", async () => {
		const app = createApp();
		const res = await request(app)
			.post("/compatibility/score")
			.send({
				userId: "nonexistent-user",
				job: {
					company: "Acme",
					role: "Engineer",
					jobLink: "https://linkedin.com/jobs/99",
				},
			});
		expect(res.status).toBe(404);
	});

	it("returns 200 with score and optional breakdown", async () => {
		const app = createApp();
		const res = await request(app)
			.post("/compatibility/score")
			.send({
				userId: "score-test-user",
				job: {
					company: "Acme",
					role: "Software Engineer",
					jobLink: "https://linkedin.com/jobs/1",
					requiredYearsExperience: 3,
					technologies: ["TypeScript"],
				},
				includeBreakdown: true,
			});
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("score");
		expect(typeof res.body.score).toBe("number");
		expect(res.body.score).toBeGreaterThanOrEqual(0);
		expect(res.body.score).toBeLessThanOrEqual(100);
		expect(res.body).toHaveProperty("breakdown");
		expect(res.body.breakdown).toHaveProperty("experience");
		expect(res.body.breakdown).toHaveProperty("technology");
	});

	it("persists JobApplication when persist is true and score >= threshold", async () => {
		const app = createApp();
		const jobLink = "https://linkedin.com/jobs/persist-test";
		const res = await request(app)
			.post("/compatibility/score")
			.send({
				userId: "score-test-user",
				job: {
					company: "Persist Co",
					role: "Engineer",
					jobLink,
					requiredYearsExperience: 2,
					technologies: ["TypeScript"],
				},
				persist: true,
				threshold: 60,
			});
		expect(res.status).toBe(200);
		expect(res.body.score).toBeGreaterThanOrEqual(60);
		expect(res.body).toHaveProperty("jobApplicationId");
		const found = await jobApplicationRepository.findByUserAndJobLink(
			"score-test-user",
			jobLink,
		);
		expect(found).not.toBeNull();
		expect(found?.status).toBe("PENDING_DECISION");
		expect(found?.compatibilityScore).toBe(res.body.score);
	});

	it("does not persist when score is below threshold", async () => {
		const app = createApp();
		const jobLink = "https://linkedin.com/jobs/low-score-job";
		const res = await request(app)
			.post("/compatibility/score")
			.send({
				userId: "score-test-user",
				job: {
					company: "LowScore Co",
					role: "Senior Principal",
					jobLink,
					requiredYearsExperience: 15,
					technologies: ["COBOL", "Fortran"],
				},
				persist: true,
				threshold: 60,
			});
		expect(res.status).toBe(200);
		expect(res.body.score).toBeLessThan(60);
		expect(res.body.jobApplicationId).toBeUndefined();
		const found = await jobApplicationRepository.findByUserAndJobLink(
			"score-test-user",
			jobLink,
		);
		expect(found).toBeNull();
	});
});
