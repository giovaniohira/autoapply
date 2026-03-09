import { eq, and, desc } from "drizzle-orm";
import type { JobApplication, JobApplicationStatus } from "@autoapply/shared";
import { db } from "./client.js";
import { jobApplications } from "./schema.js";

function rowToJobApplication(
	row: typeof jobApplications.$inferSelect,
): JobApplication {
	return {
		id: row.id,
		userId: row.userId,
		company: row.company,
		role: row.role,
		jobLink: row.jobLink,
		compatibilityScore: row.compatibilityScore,
		status: row.status as JobApplicationStatus,
		appliedAt: row.appliedAt,
		failureReason: row.failureReason,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export const jobApplicationRepository = {
	async findById(id: string): Promise<JobApplication | null> {
		const rows = await db
			.select()
			.from(jobApplications)
			.where(eq(jobApplications.id, id));
		const row = rows[0];
		return row ? rowToJobApplication(row) : null;
	},

	async findByUser(
		userId: string,
		opts?: {
			limit?: number;
			status?: JobApplicationStatus;
			fromDate?: Date;
			toDate?: Date;
		},
	): Promise<JobApplication[]> {
		let rows = await db
			.select()
			.from(jobApplications)
			.where(eq(jobApplications.userId, userId))
			.orderBy(desc(jobApplications.createdAt));
		if (opts?.status) {
			rows = rows.filter((r) => r.status === opts.status);
		}
		if (opts?.fromDate) {
			rows = rows.filter((r) => r.createdAt && r.createdAt >= opts.fromDate!);
		}
		if (opts?.toDate) {
			rows = rows.filter((r) => r.createdAt && r.createdAt <= opts.toDate!);
		}
		const result = rows.map(rowToJobApplication);
		if (opts?.limit !== undefined) {
			return result.slice(0, opts.limit);
		}
		return result;
	},

	async create(data: {
		id: string;
		userId: string;
		company: string;
		role: string;
		jobLink: string;
		compatibilityScore: number;
		status: JobApplicationStatus;
		appliedAt?: Date | null;
		failureReason?: string | null;
	}): Promise<JobApplication> {
		const now = new Date();
		await db.insert(jobApplications).values({
			id: data.id,
			userId: data.userId,
			company: data.company,
			role: data.role,
			jobLink: data.jobLink,
			compatibilityScore: data.compatibilityScore,
			status: data.status,
			appliedAt: data.appliedAt ?? null,
			failureReason: data.failureReason ?? null,
			createdAt: now,
			updatedAt: now,
		});
		const app = await this.findById(data.id);
		if (!app) throw new Error("JobApplication creation failed");
		return app;
	},

	async update(
		id: string,
		data: Partial<{
			status: JobApplicationStatus;
			appliedAt: Date | null;
			failureReason: string | null;
		}>,
	): Promise<JobApplication | null> {
		const existing = await this.findById(id);
		if (!existing) return null;
		const updatedAt = new Date();
		await db
			.update(jobApplications)
			.set({
				...(data.status !== undefined && { status: data.status }),
				...(data.appliedAt !== undefined && { appliedAt: data.appliedAt }),
				...(data.failureReason !== undefined && {
					failureReason: data.failureReason,
				}),
				updatedAt,
			})
			.where(eq(jobApplications.id, id));
		return this.findById(id);
	},

	async findByUserAndJobLink(
		userId: string,
		jobLink: string,
	): Promise<JobApplication | null> {
		const rows = await db
			.select()
			.from(jobApplications)
			.where(
				and(
					eq(jobApplications.userId, userId),
					eq(jobApplications.jobLink, jobLink),
				),
			);
		const row = rows[0];
		return row ? rowToJobApplication(row) : null;
	},
};
