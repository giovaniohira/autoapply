import { describe, expect, it } from "vitest";
import { computeCompatibility } from "../compatibilityService";
import type { User, UserSkill } from "@autoapply/shared";
import { COMPATIBILITY_WEIGHTS } from "@autoapply/shared";

const baseUser: User = {
	id: "u1",
	name: "Test",
	email: "test@example.com",
	phone: null,
	location: "Berlin, Germany",
	yearsExperience: 5,
	createdAt: new Date(),
	updatedAt: new Date(),
};

const noSkills: UserSkill[] = [];

describe("computeCompatibility", () => {
	it("returns score 0 for experience when user is 2+ years below required", () => {
		const result = computeCompatibility(
			{
				user: { ...baseUser, yearsExperience: 2 },
				userSkills: noSkills,
				job: {
					company: "Acme",
					role: "Engineer",
					jobLink: "https://linkedin.com/jobs/1",
					requiredYearsExperience: 5,
				},
			},
			{ includeBreakdown: true },
		);
		expect(result.breakdown?.experience).toBe(0);
		// Other criteria (60% weight) can still contribute; max score is 60 when experience is 0
		expect(result.score).toBeLessThanOrEqual(60);
	});

	it("returns proportional experience score when user is 1 year below required", () => {
		const result = computeCompatibility(
			{
				user: { ...baseUser, yearsExperience: 4 },
				userSkills: noSkills,
				job: {
					company: "Acme",
					role: "Engineer",
					jobLink: "https://linkedin.com/jobs/1",
					requiredYearsExperience: 5,
				},
			},
			{ includeBreakdown: true },
		);
		expect(result.breakdown?.experience).toBeGreaterThan(0);
		expect(result.breakdown?.experience).toBe(80); // 4/5 * 100
	});

	it("technology score is 0 when no overlap between job techs and user skills", () => {
		const result = computeCompatibility(
			{
				user: baseUser,
				userSkills: [
					{
						id: "s1",
						userId: "u1",
						skill: "Python",
						yearsExperience: 3,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
				job: {
					company: "Acme",
					role: "Engineer",
					jobLink: "https://linkedin.com/jobs/1",
					technologies: ["Java", "Kotlin"],
				},
			},
			{ includeBreakdown: true },
		);
		expect(result.breakdown?.technology).toBe(0);
	});

	it("technology score is 100 when all job techs match user skills", () => {
		const result = computeCompatibility(
			{
				user: baseUser,
				userSkills: [
					{
						id: "s1",
						userId: "u1",
						skill: "TypeScript",
						yearsExperience: 2,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					{
						id: "s2",
						userId: "u1",
						skill: "Node.js",
						yearsExperience: 3,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				],
				job: {
					company: "Acme",
					role: "Engineer",
					jobLink: "https://linkedin.com/jobs/1",
					technologies: ["TypeScript", "Node.js"],
				},
			},
			{ includeBreakdown: true },
		);
		expect(result.breakdown?.technology).toBe(100);
	});

	it("location score is high when job is remote", () => {
		const result = computeCompatibility(
			{
				user: baseUser,
				userSkills: noSkills,
				job: {
					company: "Acme",
					role: "Engineer",
					jobLink: "https://linkedin.com/jobs/1",
					location: { remote: true },
				},
			},
			{ includeBreakdown: true },
		);
		expect(result.breakdown?.location).toBe(100);
	});

	it("location score is low when job has location and user location does not match", () => {
		const result = computeCompatibility(
			{
				user: { ...baseUser, location: "London, UK" },
				userSkills: noSkills,
				job: {
					company: "Acme",
					role: "Engineer",
					jobLink: "https://linkedin.com/jobs/1",
					location: { country: "Germany", city: "Munich" },
				},
			},
			{ includeBreakdown: true },
		);
		expect(result.breakdown?.location).toBe(40);
	});

	it("final score is weighted sum of criteria and clamped 0-100", () => {
		const result = computeCompatibility(
			{
				user: baseUser,
				userSkills: noSkills,
				job: {
					company: "Acme",
					role: "Engineer",
					jobLink: "https://linkedin.com/jobs/1",
				},
			},
			{ includeBreakdown: true },
		);
		expect(result.score).toBeGreaterThanOrEqual(0);
		expect(result.score).toBeLessThanOrEqual(100);
		const expected =
			(result.breakdown!.experience * COMPATIBILITY_WEIGHTS.experience +
				result.breakdown!.technology * COMPATIBILITY_WEIGHTS.technology +
				result.breakdown!.role * COMPATIBILITY_WEIGHTS.role +
				result.breakdown!.location * COMPATIBILITY_WEIGHTS.location +
				result.breakdown!.additional * COMPATIBILITY_WEIGHTS.additional) /
			100;
		expect(result.score).toBe(Math.round(expected));
	});

	it("does not include breakdown when includeBreakdown is false", () => {
		const result = computeCompatibility(
			{ user: baseUser, userSkills: noSkills, job: { company: "A", role: "R", jobLink: "https://x.com/1" } },
			{ includeBreakdown: false },
		);
		expect(result.breakdown).toBeUndefined();
		expect(result.score).toBeGreaterThanOrEqual(0);
	});
});
