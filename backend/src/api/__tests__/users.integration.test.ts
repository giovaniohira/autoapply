import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { runMigrations } from "../../db/migrate.js";
import { createApp } from "../../app.js";

beforeAll(() => {
	runMigrations();
});

describe("Users API", () => {
	const testUserId = "phase4-user-1";

	it("POST /users creates a user", async () => {
		const app = createApp();
		const res = await request(app)
			.post("/users")
			.send({
				id: testUserId,
				name: "Phase Four User",
				email: "phase4@example.com",
				yearsExperience: 3,
			});
		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({
			id: testUserId,
			name: "Phase Four User",
			email: "phase4@example.com",
			yearsExperience: 3,
		});
	});

	it("POST /users returns 409 for duplicate id", async () => {
		const app = createApp();
		const res = await request(app)
			.post("/users")
			.send({
				id: testUserId,
				name: "Duplicate",
				email: "dup@example.com",
				yearsExperience: 0,
			});
		expect(res.status).toBe(409);
	});

	it("GET /users/:id returns user with skills", async () => {
		const app = createApp();
		const res = await request(app).get(`/users/${testUserId}`);
		expect(res.status).toBe(200);
		expect(res.body.id).toBe(testUserId);
		expect(Array.isArray(res.body.skills)).toBe(true);
	});

	it("GET /users/:id returns 404 for unknown id", async () => {
		const app = createApp();
		const res = await request(app).get("/users/nonexistent-id");
		expect(res.status).toBe(404);
	});

	it("PATCH /users/:id updates user", async () => {
		const app = createApp();
		const res = await request(app)
			.patch(`/users/${testUserId}`)
			.send({ name: "Updated Name", yearsExperience: 5 });
		expect(res.status).toBe(200);
		expect(res.body.name).toBe("Updated Name");
		expect(res.body.yearsExperience).toBe(5);
	});

	it("POST /users/:id/skills adds a skill", async () => {
		const app = createApp();
		const res = await request(app)
			.post(`/users/${testUserId}/skills`)
			.send({ skill: "Node.js", yearsExperience: 2 });
		expect(res.status).toBe(201);
		expect(res.body.skill).toBe("Node.js");
		expect(res.body.yearsExperience).toBe(2);
	});

	it("GET /users/:id/skills returns skills", async () => {
		const app = createApp();
		const res = await request(app).get(`/users/${testUserId}/skills`);
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body.some((s: { skill: string }) => s.skill === "Node.js")).toBe(
			true,
		);
	});
});
