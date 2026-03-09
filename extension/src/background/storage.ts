/**
 * Storage keys and default values for the extension.
 */

export const STORAGE_KEYS = {
	BACKEND_URL: "autoapply_backend_url",
	USER_TOKEN: "autoapply_user_token",
	USER_ID: "autoapply_user_id",
	DEFAULT_THRESHOLD: "autoapply_default_threshold",
	AUTOMATION_ENABLED: "autoapply_automation_enabled",
	/** Timestamps (ISO strings) of recent apply actions for rate limiting. */
	APPLY_TIMESTAMPS: "autoapply_apply_timestamps",
} as const;

export const DEFAULTS = {
	BACKEND_URL: "http://127.0.0.1:3000",
	DEFAULT_THRESHOLD: 60,
	AUTOMATION_ENABLED: true,
	/** Max applications per time window (rate limit). */
	RATE_LIMIT_COUNT: 10,
	/** Time window in ms (1 hour). */
	RATE_LIMIT_WINDOW_MS: 60 * 60 * 1000,
} as const;
