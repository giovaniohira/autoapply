import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { runMigrations } from "../../db/migrate.js";
import { userRepository } from "../../db/userRepository.js";
import { createApp } from "../../app.js";

beforeAll(() => {
	runMigrations();
});

describe("GET /users/:id/applications", () => {
	const applicationsUserId = "phase4-apps-user";

	beforeAll(async () => {
		await userRepository.create({
			id: applicationsUserId,
			name: "Apps User",
			email: "apps@example.com",
			yearsExperience: 2,
		});
	});

	it("returns 404 for unknown user", async () => {
		const app = createApp();
		const res = await request(app).get(
			"/users/nonexistent-user-id/applications",
		);
		expect(res.status).toBe(404);
	});

	it("returns 200 and array for user with no applications", async () => {
		const app = createApp();
		const res = await request(app).get(
			`/users/${applicationsUserId}/applications`,
		);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body.length).toBe(0);
	});

	it("accepts query params status and limit", async () => {
		const app = createApp();
		const res = await request(app)
			.get(`/users/${applicationsUserId}/applications`)
			.query({ status: "READY_FOR_EXTENSION", limit: "10" });
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
	});
});
