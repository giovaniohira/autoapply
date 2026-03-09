import { eq } from "drizzle-orm";
import type { ApplicationAnswer } from "@autoapply/shared";
import { db } from "./client.js";
import { applicationAnswers } from "./schema.js";

function rowToApplicationAnswer(
	row: typeof applicationAnswers.$inferSelect,
): ApplicationAnswer {
	return {
		id: row.id,
		jobApplicationId: row.jobApplicationId,
		question: row.question,
		answer: row.answer,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export const applicationAnswerRepository = {
	async findById(id: string): Promise<ApplicationAnswer | null> {
		const rows = await db
			.select()
			.from(applicationAnswers)
			.where(eq(applicationAnswers.id, id));
		const row = rows[0];
		return row ? rowToApplicationAnswer(row) : null;
	},

	async findByJobApplicationId(
		jobApplicationId: string,
	): Promise<ApplicationAnswer[]> {
		const rows = await db
			.select()
			.from(applicationAnswers)
			.where(eq(applicationAnswers.jobApplicationId, jobApplicationId));
		return rows.map(rowToApplicationAnswer);
	},

	async create(data: {
		id: string;
		jobApplicationId: string;
		question: string;
		answer: string;
	}): Promise<ApplicationAnswer> {
		const now = new Date();
		await db.insert(applicationAnswers).values({
			id: data.id,
			jobApplicationId: data.jobApplicationId,
			question: data.question,
			answer: data.answer,
			createdAt: now,
			updatedAt: now,
		});
		const answer = await this.findById(data.id);
		if (!answer) throw new Error("ApplicationAnswer creation failed");
		return answer;
	},
};
