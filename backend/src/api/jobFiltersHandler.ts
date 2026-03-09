import type { Request, Response } from "express";
import { userRepository } from "../db/userRepository.js";
import { jobFiltersRepository } from "../db/jobFiltersRepository.js";
import { jobFiltersBodySchema } from "./schemas/jobFilters.js";

export async function getJobFilters(req: Request, res: Response): Promise<void> {
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
	const filters = await jobFiltersRepository.findByUserId(id);
	res.status(200).json(filters ?? {});
}

export async function postJobFilters(req: Request, res: Response): Promise<void> {
	const id = req.params["id"];
	if (!id) {
		res.status(400).json({ error: "Missing user id" });
		return;
	}
	const parsed = jobFiltersBodySchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({
			error: "Invalid request",
			details: parsed.error.flatten(),
		});
		return;
	}
	const user = await userRepository.findById(id);
	if (!user) {
		res.status(404).json({ error: "User not found", userId: id });
		return;
	}
	const filters = await jobFiltersRepository.upsert(id, parsed.data);
	res.status(200).json(filters);
}
