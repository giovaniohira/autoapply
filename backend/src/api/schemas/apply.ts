import { z } from "zod";

const locationPreferenceSchema = z.object({
	remote: z.boolean().optional(),
	country: z.string().optional(),
	city: z.string().optional(),
});

const roleTypeSchema = z.enum([
	"BACKEND",
	"FRONTEND",
	"FULL_STACK",
	"SOFTWARE_ENGINEER",
	"DEVOPS",
	"DATA",
	"MOBILE",
	"OTHER",
]);

const jobPayloadSchema = z.object({
	company: z.string().min(1),
	role: z.string().min(1),
	jobLink: z.string().url(),
	requiredYearsExperience: z.number().int().min(0).optional(),
	technologies: z.array(z.string()).optional(),
	roleType: roleTypeSchema.optional(),
	location: locationPreferenceSchema.optional(),
	additionalRequirements: z.array(z.string()).optional(),
});

export const applyJobBodySchema = z.object({
	userId: z.string().min(1),
	job: jobPayloadSchema,
	threshold: z.number().int().min(0).max(100).optional(),
	questions: z.array(z.string().min(1)).optional().default([]),
});

export type ApplyJobBody = z.infer<typeof applyJobBodySchema>;
