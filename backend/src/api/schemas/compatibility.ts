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

export const scoreJobRequestBodySchema = z.object({
	userId: z.string().min(1),
	job: z.object({
		company: z.string().min(1),
		role: z.string().min(1),
		jobLink: z.string().url(),
		requiredYearsExperience: z.number().int().min(0).optional(),
		technologies: z.array(z.string()).optional(),
		roleType: roleTypeSchema.optional(),
		location: locationPreferenceSchema.optional(),
		additionalRequirements: z.array(z.string()).optional(),
	}),
	includeBreakdown: z.boolean().optional().default(false),
	persist: z.boolean().optional().default(false),
	threshold: z.number().int().min(0).max(100).optional(),
});

export type ScoreJobRequestBody = z.infer<typeof scoreJobRequestBodySchema>;

export const scoreResponseSchema = z.object({
	score: z.number().min(0).max(100),
	breakdown: z
		.object({
			experience: z.number(),
			technology: z.number(),
			role: z.number(),
			location: z.number(),
			additional: z.number(),
		})
		.optional(),
	jobApplicationId: z.string().uuid().optional(),
});

export type ScoreJobResponse = z.infer<typeof scoreResponseSchema>;
