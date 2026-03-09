import { beforeAll, describe, expect, it } from "vitest";
import { runMigrations } from "../migrate.js";
import { userRepository } from "../userRepository.js";
import { jobFiltersRepository } from "../jobFiltersRepository.js";

beforeAll(() => {
	runMigrations();
});

describe("jobFiltersRepository", () => {
	const userId = "job-filters-repo-user";

	beforeAll(async () => {
		await userRepository.create({
			id: userId,
			name: "Repo User",
			email: "repo@example.com",
			yearsExperience: 1,
		});
	});

	it("findByUserId returns null when no filters", async () => {
		const otherId = "no-filters-user";
		await userRepository.create({
			id: otherId,
			name: "No Filters",
			email: "nofilters@example.com",
			yearsExperience: 0,
		});
		const found = await jobFiltersRepository.findByUserId(otherId);
		expect(found).toBeNull();
	});

	it("upsert creates and returns filters", async () => {
		const filters = await jobFiltersRepository.upsert(userId, {
			role: "BACKEND",
			technologies: ["Rust"],
			minExperience: 0,
			maxExperience: 3,
		});
		expect(filters.role).toBe("BACKEND");
		expect(filters.technologies).toEqual(["Rust"]);
		expect(filters.minExperience).toBe(0);
		expect(filters.maxExperience).toBe(3);
	});

	it("upsert updates existing filters", async () => {
		const filters = await jobFiltersRepository.upsert(userId, {
			technologies: ["Rust", "TypeScript"],
			maxExperience: 5,
		});
		expect(filters.role).toBe("BACKEND");
		expect(filters.technologies).toEqual(["Rust", "TypeScript"]);
		expect(filters.maxExperience).toBe(5);
	});

	it("findByUserId returns saved filters", async () => {
		const found = await jobFiltersRepository.findByUserId(userId);
		expect(found).not.toBeNull();
		expect(found?.technologies).toEqual(["Rust", "TypeScript"]);
	});
});
