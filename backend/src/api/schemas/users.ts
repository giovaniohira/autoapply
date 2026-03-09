import { z } from "zod";

export const createUserBodySchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	email: z.string().email(),
	phone: z.string().optional().nullable(),
	location: z.string().optional().nullable(),
	yearsExperience: z.number().int().min(0),
});

export const patchUserBodySchema = z.object({
	name: z.string().min(1).optional(),
	email: z.string().email().optional(),
	phone: z.string().optional().nullable(),
	location: z.string().optional().nullable(),
	yearsExperience: z.number().int().min(0).optional(),
});

export const addSkillBodySchema = z.object({
	skill: z.string().min(1),
	yearsExperience: z.number().int().min(0).optional().nullable(),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type PatchUserBody = z.infer<typeof patchUserBodySchema>;
export type AddSkillBody = z.infer<typeof addSkillBodySchema>;
