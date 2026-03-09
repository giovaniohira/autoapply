/**
 * Structured JSON logger for backend.
 * Use for AI failures, DB errors, scoring exceptions, and audit events.
 */

export type LogLevel = "info" | "warn" | "error" | "debug";

export interface LogEntry {
	ts: string;
	level: LogLevel;
	msg: string;
	[key: string]: unknown;
}

function formatEntry(level: LogLevel, msg: string, fields?: Record<string, unknown>): string {
	const entry: LogEntry = {
		ts: new Date().toISOString(),
		level,
		msg,
		...(fields && Object.keys(fields).length > 0 ? fields : {}),
	};
	return JSON.stringify(entry);
}

function write(level: LogLevel, msg: string, fields?: Record<string, unknown>): void {
	const out = formatEntry(level, msg, fields);
	if (level === "error") {
		process.stderr.write(out + "\n");
	} else {
		process.stdout.write(out + "\n");
	}
}

export const logger = {
	info(msg: string, fields?: Record<string, unknown>): void {
		write("info", msg, fields);
	},
	warn(msg: string, fields?: Record<string, unknown>): void {
		write("warn", msg, fields);
	},
	error(msg: string, fields?: Record<string, unknown>): void {
		write("error", msg, fields);
	},
	debug(msg: string, fields?: Record<string, unknown>): void {
		if (process.env["NODE_ENV"] === "development") {
			write("debug", msg, fields);
		}
	},
};
