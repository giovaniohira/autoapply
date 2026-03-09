import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { runMigrations } from "../../db/migrate.js";
import { userRepository } from "../../db/userRepository.js";
import { jobApplicationRepository } from "../../db/jobApplicationRepository.js";
import { createApp } from "../../app.js";

beforeAll(() => {
	runMigrations();
});

describe("POST /apply", () => {
	const applyUserId = "phase4-apply-user";

	beforeAll(async () => {
		await userRepository.create({
			id: applyUserId,
			name: "Apply User",
			email: "apply@example.com",
			yearsExperience: 4,
		});
		await userRepository.addSkill({
			id: "apply-skill-1",
			userId: applyUserId,
			skill: "TypeScript",
			yearsExperience: 2,
		});
	});

	it("returns 404 for unknown userId", async () => {
		const app = createApp();
		const res = await request(app).post("/apply").send({
			userId: "nonexistent",
			job: {
				company: "Acme",
				role: "Engineer",
				jobLink: "https://linkedin.com/jobs/apply-1",
			},
		});
		expect(res.status).toBe(404);
	});

	it("returns 400 for invalid body", async () => {
		const app = createApp();
		const res = await request(app).post("/apply").send({ userId: applyUserId });
		expect(res.status).toBe(400);
	});

	it("applies job when score >= threshold (no questions, no AI)", async () => {
		const app = createApp();
		const jobLink = "https://linkedin.com/jobs/apply-high-score";
		const res = await request(app)
			.post("/apply")
			.send({
				userId: applyUserId,
				job: {
					company: "High Score Co",
					role: "Software Engineer",
					jobLink,
					requiredYearsExperience: 3,
					technologies: ["TypeScript"],
				},
				threshold: 60,
				questions: [],
			});
		expect(res.status).toBe(200);
		expect(res.body.status).toBe("READY_FOR_EXTENSION");
		expect(res.body.score).toBeGreaterThanOrEqual(60);
		expect(res.body.jobApplicationId).toBeDefined();
		const found = await jobApplicationRepository.findByUserAndJobLink(
			applyUserId,
			jobLink,
		);
		expect(found?.status).toBe("READY_FOR_EXTENSION");
	});

	it("records SKIPPED_LOW_SCORE when score < threshold", async () => {
		const app = createApp();
		const jobLink = "https://linkedin.com/jobs/apply-low-score";
		const res = await request(app)
			.post("/apply")
			.send({
				userId: applyUserId,
				job: {
					company: "Low Co",
					role: "Principal Architect",
					jobLink,
					requiredYearsExperience: 15,
					technologies: ["COBOL"],
				},
				threshold: 60,
			});
		expect(res.status).toBe(200);
		expect(res.body.status).toBe("SKIPPED_LOW_SCORE");
		expect(res.body.score).toBeLessThan(60);
		const found = await jobApplicationRepository.findByUserAndJobLink(
			applyUserId,
			jobLink,
		);
		expect(found?.status).toBe("SKIPPED_LOW_SCORE");
	});
});
