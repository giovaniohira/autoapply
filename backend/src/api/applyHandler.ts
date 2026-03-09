import type { Request, Response } from "express";
import { applyJob } from "../jobs/applyJobService.js";
import { applyJobBodySchema } from "./schemas/apply.js";
import { logger } from "../logger.js";

export async function postApply(req: Request, res: Response): Promise<void> {
	const parsed = applyJobBodySchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({
			error: "Invalid request",
			details: parsed.error.flatten(),
		});
		return;
	}
	try {
		const result = await applyJob({
			userId: parsed.data.userId,
			job: parsed.data.job,
			threshold: parsed.data.threshold,
			questions: parsed.data.questions,
		});
		res.status(200).json(result);
	} catch (err) {
		const message = err instanceof Error ? err.message : "Apply job failed";
		if (message === "User not found") {
			res.status(404).json({ error: message });
			return;
		}
		logger.error("Apply job failed", {
			error: message,
			stack: err instanceof Error ? err.stack : undefined,
		});
		res.status(500).json({ error: message });
	}
}
