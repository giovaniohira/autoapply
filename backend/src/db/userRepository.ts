import { eq } from "drizzle-orm";
import type { User, UserSkill } from "@autoapply/shared";
import { db } from "./client";
import { users, userSkills } from "./schema";

function rowToUser(row: typeof users.$inferSelect): User {
	return {
		id: row.id,
		name: row.name,
		email: row.email,
		phone: row.phone,
		location: row.location,
		yearsExperience: row.yearsExperience,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

function rowToUserSkill(row: typeof userSkills.$inferSelect): UserSkill {
	return {
		id: row.id,
		userId: row.userId,
		skill: row.skill,
		yearsExperience: row.yearsExperience,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export const userRepository = {
	async findById(id: string): Promise<User | null> {
		const rows = await db.select().from(users).where(eq(users.id, id));
		const row = rows[0];
		return row ? rowToUser(row) : null;
	},

	async create(data: {
		id: string;
		name: string;
		email: string;
		phone?: string | null;
		location?: string | null;
		yearsExperience: number;
	}): Promise<User> {
		const now = new Date();
		await db.insert(users).values({
			id: data.id,
			name: data.name,
			email: data.email,
			phone: data.phone ?? null,
			location: data.location ?? null,
			yearsExperience: data.yearsExperience,
			createdAt: now,
			updatedAt: now,
		});
		const user = await this.findById(data.id);
		if (!user) throw new Error("User creation failed");
		return user;
	},

	async update(
		id: string,
		data: Partial<
			Pick<User, "name" | "email" | "phone" | "location" | "yearsExperience">
		>,
	): Promise<User | null> {
		const existing = await this.findById(id);
		if (!existing) return null;
		const updatedAt = new Date();
		await db
			.update(users)
			.set({
				...(data.name !== undefined && { name: data.name }),
				...(data.email !== undefined && { email: data.email }),
				...(data.phone !== undefined && { phone: data.phone }),
				...(data.location !== undefined && { location: data.location }),
				...(data.yearsExperience !== undefined && {
					yearsExperience: data.yearsExperience,
				}),
				updatedAt,
			})
			.where(eq(users.id, id));
		return this.findById(id);
	},

	async getSkills(userId: string): Promise<UserSkill[]> {
		const rows = await db
			.select()
			.from(userSkills)
			.where(eq(userSkills.userId, userId));
		return rows.map(rowToUserSkill);
	},

	async addSkill(data: {
		id: string;
		userId: string;
		skill: string;
		yearsExperience?: number | null;
	}): Promise<UserSkill> {
		const now = new Date();
		await db.insert(userSkills).values({
			id: data.id,
			userId: data.userId,
			skill: data.skill,
			yearsExperience: data.yearsExperience ?? null,
			createdAt: now,
			updatedAt: now,
		});
		const rows = await db
			.select()
			.from(userSkills)
			.where(eq(userSkills.id, data.id));
		const row = rows[0];
		if (!row) throw new Error("UserSkill creation failed");
		return rowToUserSkill(row);
	},
};
