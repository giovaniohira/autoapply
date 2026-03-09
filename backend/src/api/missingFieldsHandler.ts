import type { Request, Response } from "express";
import { jobApplicationRepository } from "../db/jobApplicationRepository.js";

/**
 * POST /applications/:id/missing-fields
 * Body: { missingFields: string[] }
 * Logs missing fields and updates application status to INCOMPLETE for audit.
 */
export async function postMissingFields(req: Request, res: Response): Promise<void> {
	const id = req.params["id"];
	if (!id) {
		res.status(400).json({ error: "Missing application id" });
		return;
	}
	const body = req.body as { missingFields?: unknown };
	const raw = body?.missingFields;
	const missingFields = Array.isArray(raw)
		? (raw as string[]).filter((s) => typeof s === "string")
		: [];
	if (missingFields.length === 0) {
		res.status(400).json({ error: "missingFields must be a non-empty array of strings" });
		return;
	}
	const application = await jobApplicationRepository.findById(id);
	if (!application) {
		res.status(404).json({ error: "Application not found" });
		return;
	}
	const reason = `Missing fields: ${missingFields.join(", ")}`;
	// eslint-disable-next-line no-console
	console.warn("[AutoApply] Application incomplete:", { id, missingFields });
	await jobApplicationRepository.update(id, {
		status: "INCOMPLETE",
		failureReason: reason,
	});
	res.status(204).send();
}
