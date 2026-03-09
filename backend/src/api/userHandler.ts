import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import { userRepository } from "../db/userRepository.js";
import {
	createUserBodySchema,
	patchUserBodySchema,
	addSkillBodySchema,
} from "./schemas/users.js";

export async function getUsers(req: Request, res: Response): Promise<void> {
	// For MVP we don't have list-all; require explicit id. Return 400 or 404.
	res.status(501).json({ error: "List users not implemented; use GET /users/:id" });
}

export async function getUserById(req: Request, res: Response): Promise<void> {
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
	const skills = await userRepository.getSkills(id);
	res.status(200).json({ ...user, skills });
}

export async function postUser(req: Request, res: Response): Promise<void> {
	const parsed = createUserBodySchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({
			error: "Invalid request",
			details: parsed.error.flatten(),
		});
		return;
	}
	const data = parsed.data;
	try {
		const user = await userRepository.create({
			id: data.id,
			name: data.name,
			email: data.email,
			phone: data.phone ?? null,
			location: data.location ?? null,
			yearsExperience: data.yearsExperience,
		});
		res.status(201).json(user);
	} catch {
		// Duplicate id
		res.status(409).json({
			error: "User already exists",
			userId: data.id,
		});
	}
}

export async function patchUser(req: Request, res: Response): Promise<void> {
	const id = req.params["id"];
	if (!id) {
		res.status(400).json({ error: "Missing user id" });
		return;
	}
	const parsed = patchUserBodySchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({
			error: "Invalid request",
			details: parsed.error.flatten(),
		});
		return;
	}
	const user = await userRepository.update(id, parsed.data);
	if (!user) {
		res.status(404).json({ error: "User not found", userId: id });
		return;
	}
	res.status(200).json(user);
}

export async function getUserSkills(req: Request, res: Response): Promise<void> {
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
	const skills = await userRepository.getSkills(id);
	res.status(200).json(skills);
}

export async function postUserSkill(req: Request, res: Response): Promise<void> {
	const id = req.params["id"];
	if (!id) {
		res.status(400).json({ error: "Missing user id" });
		return;
	}
	const parsed = addSkillBodySchema.safeParse(req.body);
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
	const skill = await userRepository.addSkill({
		id: randomUUID(),
		userId: id,
		skill: parsed.data.skill,
		yearsExperience: parsed.data.yearsExperience ?? null,
	});
	res.status(201).json(skill);
}
