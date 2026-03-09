import {
	sqliteTable,
	text,
	integer,
	real,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	phone: text("phone"),
	location: text("location"),
	yearsExperience: integer("years_experience").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const userSkills = sqliteTable("user_skills", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	skill: text("skill").notNull(),
	yearsExperience: integer("years_experience"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const jobApplications = sqliteTable("job_applications", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	company: text("company").notNull(),
	role: text("role").notNull(),
	jobLink: text("job_link").notNull(),
	compatibilityScore: real("compatibility_score").notNull(),
	status: text("status").notNull(),
	appliedAt: integer("applied_at", { mode: "timestamp" }),
	failureReason: text("failure_reason"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const applicationAnswers = sqliteTable("application_answers", {
	id: text("id").primaryKey(),
	jobApplicationId: text("job_application_id")
		.notNull()
		.references(() => jobApplications.id, { onDelete: "cascade" }),
	question: text("question").notNull(),
	answer: text("answer").notNull(),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const jobFilters = sqliteTable("job_filters", {
	userId: text("user_id")
		.primaryKey()
		.references(() => users.id, { onDelete: "cascade" }),
	role: text("role"),
	technologiesJson: text("technologies_json"),
	locationJson: text("location_json"),
	minExperience: integer("min_experience"),
	maxExperience: integer("max_experience"),
	createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
