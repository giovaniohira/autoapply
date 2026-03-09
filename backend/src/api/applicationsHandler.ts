import type { Request, Response } from "express";
import { userRepository } from "../db/userRepository.js";
import { jobApplicationRepository } from "../db/jobApplicationRepository.js";
import type { JobApplicationStatus } from "@autoapply/shared";

export async function getApplications(req: Request, res: Response): Promise<void> {
	const id = req.params["id"];
	if (!id) {
		res.status(400).json({ error: "Missing user id" });
		return;
	}
	const user = await userRepository.findById(id);
	if (!user) {
		res.status(404).json({ error: "User not found", userId: id });
		return;
	}
	const status = req.query["status"] as JobApplicationStatus | undefined;
	const fromDate = req.query["fromDate"];
	const toDate = req.query["toDate"];
	const limitRaw = req.query["limit"];

	const from =
		typeof fromDate === "string" && fromDate
			? new Date(fromDate)
			: undefined;
	const to =
		typeof toDate === "string" && toDate ? new Date(toDate) : undefined;
	const limit =
		typeof limitRaw === "string" && /^\d+$/.test(limitRaw)
			? parseInt(limitRaw, 10)
			: undefined;

	const applications = await jobApplicationRepository.findByUser(id, {
		status: status ?? undefined,
		fromDate: from,
		toDate: to,
		limit,
	});
	res.status(200).json(applications);
}
