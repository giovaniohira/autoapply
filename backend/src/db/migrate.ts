import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { rawSqlite } from "./client";

const MIGRATIONS_DIR = join(__dirname, "..", "..", "drizzle");
const STATEMENT_BREAKPOINT = "--> statement-breakpoint";

export function runMigrations(): void {
	const files = readdirSync(MIGRATIONS_DIR)
		.filter((f) => f.endsWith(".sql"))
		.sort();
	for (const file of files) {
		const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf-8");
		const statements = sql
			.split(STATEMENT_BREAKPOINT)
			.map((s) => s.trim())
			.filter(Boolean);
		for (const statement of statements) {
			rawSqlite.exec(statement);
		}
	}
}
