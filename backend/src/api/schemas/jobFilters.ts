import { z } from "zod";

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

const locationPreferenceSchema = z.object({
	remote: z.boolean().optional(),
	country: z.string().optional(),
	city: z.string().optional(),
});

export const jobFiltersBodySchema = z.object({
	role: roleTypeSchema.optional().nullable(),
	technologies: z.array(z.string()).optional().nullable(),
	location: locationPreferenceSchema.optional().nullable(),
	minExperience: z.number().int().min(0).optional().nullable(),
	maxExperience: z.number().int().min(0).optional().nullable(),
});

export type JobFiltersBody = z.infer<typeof jobFiltersBodySchema>;
