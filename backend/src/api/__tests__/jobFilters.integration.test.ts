import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { runMigrations } from "../../db/migrate.js";
import { userRepository } from "../../db/userRepository.js";
import { createApp } from "../../app.js";

beforeAll(() => {
	runMigrations();
});

describe("Job filters API", () => {
	const filterUserId = "phase4-filters-user";

	beforeAll(async () => {
		await userRepository.create({
			id: filterUserId,
			name: "Filters User",
			email: "filters@example.com",
			yearsExperience: 2,
		});
	});

	it("GET /users/:id/job-filters returns empty when none set", async () => {
		const app = createApp();
		const res = await request(app).get(
			`/users/${filterUserId}/job-filters`,
		);
		expect(res.status).toBe(200);
		expect(res.body).toEqual({});
	});

	it("POST /users/:id/job-filters upserts filters", async () => {
		const app = createApp();
		const res = await request(app)
			.post(`/users/${filterUserId}/job-filters`)
			.send({
				role: "BACKEND",
				technologies: ["TypeScript", "Node.js"],
				minExperience: 1,
				maxExperience: 5,
			});
		expect(res.status).toBe(200);
		expect(res.body.role).toBe("BACKEND");
		expect(res.body.technologies).toEqual(["TypeScript", "Node.js"]);
		expect(res.body.minExperience).toBe(1);
		expect(res.body.maxExperience).toBe(5);
	});

	it("GET /users/:id/job-filters returns saved filters", async () => {
		const app = createApp();
		const res = await request(app).get(
			`/users/${filterUserId}/job-filters`,
		);
		expect(res.status).toBe(200);
		expect(res.body.role).toBe("BACKEND");
		expect(res.body.technologies).toEqual(["TypeScript", "Node.js"]);
	});
});
