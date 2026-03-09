import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { runMigrations } from "../../db/migrate.js";
import { userRepository } from "../../db/userRepository.js";
import { jobApplicationRepository } from "../../db/jobApplicationRepository.js";
import { createApp } from "../../app.js";

beforeAll(() => {
	runMigrations();
});

describe("POST /applications/:id/missing-fields", () => {
	const userId = "missing-fields-user";
	let jobApplicationId: string;

	beforeAll(async () => {
		await userRepository.create({
			id: userId,
			name: "Test User",
			email: "test@example.com",
			yearsExperience: 3,
		});
		const app = await jobApplicationRepository.create({
			id: "missing-fields-app-1",
			userId,
			company: "Acme",
			role: "Engineer",
			jobLink: "https://linkedin.com/jobs/view/123",
			compatibilityScore: 75,
			status: "READY_FOR_EXTENSION",
		});
		jobApplicationId = app.id;
	});

	it("returns 400 when missingFields is missing or empty", async () => {
		const app = createApp();
		const res = await request(app)
			.post(`/applications/${jobApplicationId}/missing-fields`)
			.send({});
		expect(res.status).toBe(400);
		const res2 = await request(app)
			.post(`/applications/${jobApplicationId}/missing-fields`)
			.send({ missingFields: [] });
		expect(res2.status).toBe(400);
	});

	it("returns 404 for unknown application id", async () => {
		const app = createApp();
		const res = await request(app)
			.post("/applications/nonexistent-id/missing-fields")
			.send({ missingFields: ["phone", "location"] });
		expect(res.status).toBe(404);
	});

	it("updates application to INCOMPLETE and sets failureReason", async () => {
		const app = createApp();
		const res = await request(app)
			.post(`/applications/${jobApplicationId}/missing-fields`)
			.send({ missingFields: ["phone", "location"] });
		expect(res.status).toBe(204);
		const updated = await jobApplicationRepository.findById(jobApplicationId);
		expect(updated?.status).toBe("INCOMPLETE");
		expect(updated?.failureReason).toContain("phone");
		expect(updated?.failureReason).toContain("location");
	});
});
