import { randomUUID } from "node:crypto";
import type { JobPayload } from "@autoapply/shared";
import { DEFAULT_COMPATIBILITY_THRESHOLD } from "@autoapply/shared";
import { userRepository } from "../db/userRepository.js";
import { jobApplicationRepository } from "../db/jobApplicationRepository.js";
import { applicationAnswerRepository } from "../db/applicationAnswerRepository.js";
import { computeCompatibility } from "../scoring/compatibilityService.js";
import { generateAnswer } from "../ai/aiClient.js";

export interface ApplyJobInput {
	userId: string;
	job: JobPayload;
	threshold?: number;
	/** Open-ended questions to generate AI answers for (when score >= threshold). */
	questions?: string[];
}

export interface ApplyJobResult {
	jobApplicationId: string;
	score: number;
	status: "READY_FOR_EXTENSION" | "SKIPPED_LOW_SCORE";
	answers?: Array<{ question: string; answer: string }>;
}

function buildProfileText(user: Awaited<ReturnType<typeof userRepository.findById>>, skills: Awaited<ReturnType<typeof userRepository.getSkills>>): string {
	if (!user) return "";
	const parts = [
		`Name: ${user.name}`,
		`Email: ${user.email}`,
		`Location: ${user.location ?? "—"}`,
		`Years of experience: ${user.yearsExperience}`,
	];
	if (skills.length) {
		parts.push(
			`Skills: ${skills.map((s) => (s.yearsExperience != null ? `${s.skill} (${s.yearsExperience}y)` : s.skill)).join(", ")}`,
		);
	}
	return parts.join("\n");
}

export async function applyJob(input: ApplyJobInput): Promise<ApplyJobResult> {
	const { userId, job, questions = [] } = input;
	const threshold = input.threshold ?? DEFAULT_COMPATIBILITY_THRESHOLD;

	const user = await userRepository.findById(userId);
	if (!user) {
		throw new Error("User not found");
	}
	const userSkills = await userRepository.getSkills(userId);
	const { score } = computeCompatibility({ user, userSkills, job });

	const existing = await jobApplicationRepository.findByUserAndJobLink(
		userId,
		job.jobLink,
	);

	if (score < threshold) {
		const id = existing?.id ?? randomUUID();
		if (!existing) {
			await jobApplicationRepository.create({
				id,
				userId,
				company: job.company,
				role: job.role,
				jobLink: job.jobLink,
				compatibilityScore: score,
				status: "SKIPPED_LOW_SCORE",
			});
		}
		return {
			jobApplicationId: id,
			score,
			status: "SKIPPED_LOW_SCORE",
		};
	}

	const jobApplicationId = existing?.id ?? randomUUID();
	const jobDescription = [
		`Company: ${job.company}`,
		`Role: ${job.role}`,
		job.requiredYearsExperience != null
			? `Required experience: ${job.requiredYearsExperience} years`
			: "",
		job.technologies?.length
			? `Technologies: ${job.technologies.join(", ")}`
			: "",
	]
		.filter(Boolean)
		.join("\n");

	const profileText = buildProfileText(user, userSkills);
	const answers: Array<{ question: string; answer: string }> = [];

	if (!existing) {
		await jobApplicationRepository.create({
			id: jobApplicationId,
			userId,
			company: job.company,
			role: job.role,
			jobLink: job.jobLink,
			compatibilityScore: score,
			status: "READY_FOR_EXTENSION",
		});
	}

	for (const question of questions) {
		try {
			const answerText = await generateAnswer({
				resumeOrProfile: profileText,
				jobDescription,
				question,
			});
			await applicationAnswerRepository.create({
				id: randomUUID(),
				jobApplicationId,
				question,
				answer: answerText,
			});
			answers.push({ question, answer: answerText });
		} catch (err) {
			// Log but do not fail the whole apply; answer can be filled manually
			// eslint-disable-next-line no-console
			console.error("AI answer generation failed for question:", question, err);
		}
	}

	if (existing && (existing.status === "PENDING_DECISION" || existing.status === "READY_FOR_EXTENSION")) {
		await jobApplicationRepository.update(jobApplicationId, {
			status: "READY_FOR_EXTENSION",
		});
	}

	return {
		jobApplicationId,
		score,
		status: "READY_FOR_EXTENSION",
		...(answers.length > 0 && { answers }),
	};
}
