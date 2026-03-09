/**
 * Storage keys and default values for the extension.
 */

export const STORAGE_KEYS = {
	BACKEND_URL: "autoapply_backend_url",
	USER_TOKEN: "autoapply_user_token",
	USER_ID: "autoapply_user_id",
	DEFAULT_THRESHOLD: "autoapply_default_threshold",
} as const;

export const DEFAULTS = {
	BACKEND_URL: "http://127.0.0.1:3000",
	DEFAULT_THRESHOLD: 60,
} as const;
