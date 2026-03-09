/**
 * Structured diagnostic logging for the extension.
 * Outputs JSON-like entries for easier filtering in devtools (e.g. by "AutoApply" or level).
 */

const PREFIX = "[AutoApply]";

type LogLevel = "info" | "warn" | "error" | "debug";

function formatEntry(level: LogLevel, msg: string, fields?: Record<string, unknown>): string {
	const entry = {
		ts: new Date().toISOString(),
		level,
		msg,
		...(fields && Object.keys(fields).length > 0 ? fields : {}),
	};
	return `${PREFIX} ${JSON.stringify(entry)}`;
}

export const logger = {
	info(msg: string, fields?: Record<string, unknown>): void {
		// eslint-disable-next-line no-console
		console.log(formatEntry("info", msg, fields));
	},
	warn(msg: string, fields?: Record<string, unknown>): void {
		// eslint-disable-next-line no-console
		console.warn(formatEntry("warn", msg, fields));
	},
	error(msg: string, fields?: Record<string, unknown>): void {
		// eslint-disable-next-line no-console
		console.error(formatEntry("error", msg, fields));
	},
	debug(msg: string, fields?: Record<string, unknown>): void {
		// Only in development or when explicitly enabled via storage
		// eslint-disable-next-line no-console
		console.debug(formatEntry("debug", msg, fields));
	},
};
