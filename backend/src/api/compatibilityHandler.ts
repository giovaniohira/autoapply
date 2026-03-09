import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { DEFAULT_COMPATIBILITY_THRESHOLD } from "@autoapply/shared";
import { userRepository } from "../db/userRepository.js";
import { jobApplicationRepository } from "../db/jobApplicationRepository.js";
import { computeCompatibility } from "../scoring/compatibilityService.js";
import {
	scoreJobRequestBodySchema,
	type ScoreJobResponse,
} from "./schemas/compatibility.js";

export async function postScore(req: Request, res: Response): Promise<void> {
	const parsed = scoreJobRequestBodySchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: "Invalid request", details: parsed.error.flatten() });
		return;
	}
	const { userId, job, includeBreakdown, persist, threshold } = parsed.data;
	const effectiveThreshold = threshold ?? DEFAULT_COMPATIBILITY_THRESHOLD;

	const user = await userRepository.findById(userId);
	if (!user) {
		res.status(404).json({ error: "User not found", userId });
		return;
	}
	const userSkills = await userRepository.getSkills(userId);

	const result = computeCompatibility(
		{ user, userSkills, job },
		{ includeBreakdown },
	);

	const response: ScoreJobResponse = {
		score: result.score,
		...(result.breakdown && { breakdown: result.breakdown }),
	};

	if (persist && result.score >= effectiveThreshold) {
		const existing = await jobApplicationRepository.findByUserAndJobLink(
			userId,
			job.jobLink,
		);
		if (!existing) {
			const id = randomUUID();
			await jobApplicationRepository.create({
				id,
				userId,
				company: job.company,
				role: job.role,
				jobLink: job.jobLink,
				compatibilityScore: result.score,
				status: "PENDING_DECISION",
			});
			response.jobApplicationId = id;
		} else {
			response.jobApplicationId = existing.id;
		}
	}

	res.status(200).json(response);
}
