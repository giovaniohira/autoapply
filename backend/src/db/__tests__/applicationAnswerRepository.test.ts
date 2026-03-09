import { beforeAll, describe, expect, it } from "vitest";
import { runMigrations } from "../migrate";
import { userRepository } from "../userRepository";
import { jobApplicationRepository } from "../jobApplicationRepository";
import { applicationAnswerRepository } from "../applicationAnswerRepository";

beforeAll(async () => {
	runMigrations();
	await userRepository.create({
		id: "u-ans",
		name: "Answer User",
		email: "ans@example.com",
		yearsExperience: 2,
	});
	await jobApplicationRepository.create({
		id: "ja-ans",
		userId: "u-ans",
		company: "Co",
		role: "Engineer",
		jobLink: "https://linkedin.com/jobs/ans",
		compatibilityScore: 70,
		status: "READY_FOR_EXTENSION",
	});
});

describe("applicationAnswerRepository", () => {
	it("creates and finds answer by id", async () => {
		const created = await applicationAnswerRepository.create({
			id: "aa-1",
			jobApplicationId: "ja-ans",
			question: "Why do you want to join?",
			answer: "I am excited about the mission.",
		});
		expect(created.question).toBe("Why do you want to join?");
		expect(created.answer).toContain("excited");

		const found = await applicationAnswerRepository.findById("aa-1");
		expect(found?.jobApplicationId).toBe("ja-ans");
	});

	it("finds all answers by job application id", async () => {
		await applicationAnswerRepository.create({
			id: "aa-2",
			jobApplicationId: "ja-ans",
			question: "Describe your experience.",
			answer: "I have 2 years of experience.",
		});
		const answers = await applicationAnswerRepository.findByJobApplicationId(
			"ja-ans",
		);
		expect(answers.length).toBeGreaterThanOrEqual(2);
		expect(answers.every((a) => a.jobApplicationId === "ja-ans")).toBe(true);
	});
});
