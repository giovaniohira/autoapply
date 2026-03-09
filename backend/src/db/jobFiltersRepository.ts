import { eq } from "drizzle-orm";
import type { JobFilters } from "@autoapply/shared";
import { db } from "./client.js";
import { jobFilters } from "./schema.js";

function parseJobFilters(row: typeof jobFilters.$inferSelect): JobFilters {
	return {
		role: row.role ?? null,
		technologies:
			row.technologiesJson != null
				? (JSON.parse(row.technologiesJson) as string[])
				: null,
		location:
			row.locationJson != null
				? (JSON.parse(row.locationJson) as JobFilters["location"])
				: null,
		minExperience: row.minExperience ?? null,
		maxExperience: row.maxExperience ?? null,
	};
}

export const jobFiltersRepository = {
	async findByUserId(userId: string): Promise<JobFilters | null> {
		const rows = await db
			.select()
			.from(jobFilters)
			.where(eq(jobFilters.userId, userId));
		const row = rows[0];
		return row ? parseJobFilters(row) : null;
	},

	async upsert(userId: string, data: Partial<JobFilters>): Promise<JobFilters> {
		const now = new Date();
		const existing = await this.findByUserId(userId);
		const payload = {
			userId,
			role: data.role !== undefined ? data.role : existing?.role ?? null,
			technologiesJson:
				data.technologies != null
					? JSON.stringify(data.technologies)
					: existing
						? JSON.stringify(existing.technologies ?? [])
						: null,
			locationJson:
				data.location != null
					? JSON.stringify(data.location)
					: existing
						? JSON.stringify(existing.location ?? null)
						: null,
			minExperience: data.minExperience ?? existing?.minExperience ?? null,
			maxExperience: data.maxExperience ?? existing?.maxExperience ?? null,
			createdAt: now,
			updatedAt: now,
		};
		await db
			.insert(jobFilters)
			.values(payload)
			.onConflictDoUpdate({
				target: jobFilters.userId,
				set: {
					role: payload.role,
					technologiesJson: payload.technologiesJson,
					locationJson: payload.locationJson,
					minExperience: payload.minExperience,
					maxExperience: payload.maxExperience,
					updatedAt: payload.updatedAt,
				},
			});
		const out = await this.findByUserId(userId);
		if (!out) throw new Error("JobFilters upsert failed");
		return out;
	},
};
