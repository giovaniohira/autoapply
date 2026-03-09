import { beforeAll, describe, expect, it } from "vitest";
import { runMigrations } from "../migrate";
import { userRepository } from "../userRepository";

beforeAll(() => {
	runMigrations();
});

describe("userRepository", () => {
	it("creates and finds user by id", async () => {
		const created = await userRepository.create({
			id: "user-1",
			name: "Jane Doe",
			email: "jane@example.com",
			phone: "+123",
			location: "Remote",
			yearsExperience: 5,
		});
		expect(created.id).toBe("user-1");
		expect(created.name).toBe("Jane Doe");
		expect(created.yearsExperience).toBe(5);

		const found = await userRepository.findById("user-1");
		expect(found).not.toBeNull();
		expect(found?.email).toBe("jane@example.com");
	});

	it("returns null for missing user", async () => {
		const found = await userRepository.findById("missing");
		expect(found).toBeNull();
	});

	it("updates user", async () => {
		await userRepository.create({
			id: "user-2",
			name: "John",
			email: "john@example.com",
			yearsExperience: 2,
		});
		const updated = await userRepository.update("user-2", {
			name: "John Smith",
			yearsExperience: 3,
		});
		expect(updated?.name).toBe("John Smith");
		expect(updated?.yearsExperience).toBe(3);
	});

	it("adds and lists skills", async () => {
		await userRepository.create({
			id: "user-3",
			name: "Dev",
			email: "dev@example.com",
			yearsExperience: 4,
		});
		await userRepository.addSkill({
			id: "skill-1",
			userId: "user-3",
			skill: "TypeScript",
			yearsExperience: 3,
		});
		await userRepository.addSkill({
			id: "skill-2",
			userId: "user-3",
			skill: "Node.js",
			yearsExperience: null,
		});
		const skills = await userRepository.getSkills("user-3");
		expect(skills).toHaveLength(2);
		expect(skills.map((s) => s.skill)).toContain("TypeScript");
		expect(skills.map((s) => s.skill)).toContain("Node.js");
	});
});
