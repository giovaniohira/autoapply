/**
 * HTTP client for extension → backend API.
 */

import type {
	ApplyJobResponse,
	AutofillProfile,
	ScoreJobRequest,
	ScoreJobResponse,
} from "../types/api.js";
import { STORAGE_KEYS, DEFAULTS } from "./storage.js";

async function getBackendUrl(): Promise<string> {
	const out = await chrome.storage.local.get(STORAGE_KEYS.BACKEND_URL);
	return (out[STORAGE_KEYS.BACKEND_URL] as string) || DEFAULTS.BACKEND_URL;
}

async function getUserId(): Promise<string | null> {
	const out = await chrome.storage.local.get(STORAGE_KEYS.USER_ID);
	return (out[STORAGE_KEYS.USER_ID] as string) || null;
}

async function getToken(): Promise<string | null> {
	const out = await chrome.storage.local.get(STORAGE_KEYS.USER_TOKEN);
	return (out[STORAGE_KEYS.USER_TOKEN] as string) || null;
}

/**
 * POST /compatibility/score with optional auth header.
 */
export async function scoreJob(
	job: ScoreJobRequest["job"],
	options: { persist?: boolean; threshold?: number } = {},
): Promise<{ data: ScoreJobResponse } | { error: string }> {
	const baseUrl = await getBackendUrl();
	const userId = await getUserId();
	if (!userId) {
		return { error: "User not configured. Set user ID in extension options." };
	}

	const url = `${baseUrl.replace(/\/$/, "")}/compatibility/score`;
	const body: ScoreJobRequest = {
		userId,
		job,
		includeBreakdown: true,
		persist: options.persist ?? true,
		threshold: options.threshold ?? DEFAULTS.DEFAULT_THRESHOLD,
	};

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	const token = await getToken();
	if (token) headers["Authorization"] = `Bearer ${token}`;

	try {
		const res = await fetch(url, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
		});
		const data = (await res.json()) as ScoreJobResponse | { error?: string; details?: unknown };
		if (!res.ok) {
			const msg =
				typeof (data as { error?: string }).error === "string"
					? (data as { error: string }).error
					: `HTTP ${res.status}`;
			return { error: msg };
		}
		return { data: data as ScoreJobResponse };
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		return { error: `Request failed: ${message}` };
	}
}

/**
 * GET /users/:id — fetch user profile for autofill.
 */
export async function getProfile(
	userId: string,
): Promise<{ data: AutofillProfile } | { error: string }> {
	const baseUrl = await getBackendUrl();
	const url = `${baseUrl.replace(/\/$/, "")}/users/${encodeURIComponent(userId)}`;
	const headers: Record<string, string> = {};
	const token = await getToken();
	if (token) headers["Authorization"] = `Bearer ${token}`;

	try {
		const res = await fetch(url, { headers });
		const data = (await res.json()) as
			| (AutofillProfile & { skills?: unknown })
			| { error?: string };
		if (!res.ok) {
			const msg =
				typeof (data as { error?: string }).error === "string"
					? (data as { error: string }).error
					: `HTTP ${res.status}`;
			return { error: msg };
		}
		const profile: AutofillProfile = {
			name: (data as AutofillProfile).name,
			email: (data as AutofillProfile).email,
			phone: (data as AutofillProfile).phone ?? null,
			location: (data as AutofillProfile).location ?? null,
			yearsExperience: (data as AutofillProfile).yearsExperience,
		};
		return { data: profile };
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		return { error: `Request failed: ${message}` };
	}
}

/**
 * POST /apply — run apply-job orchestration (score, AI answers); returns profile data for autofill.
 */
export async function applyJob(
	userId: string,
	job: ScoreJobRequest["job"],
	options: { threshold?: number; questions?: string[] } = {},
): Promise<{ data: ApplyJobResponse } | { error: string }> {
	const baseUrl = await getBackendUrl();
	const url = `${baseUrl.replace(/\/$/, "")}/apply`;
	const body = {
		userId,
		job,
		threshold: options.threshold ?? DEFAULTS.DEFAULT_THRESHOLD,
		questions: options.questions ?? [],
	};
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	const token = await getToken();
	if (token) headers["Authorization"] = `Bearer ${token}`;

	try {
		const res = await fetch(url, {
			method: "POST",
			headers,
			body: JSON.stringify(body),
		});
		const data = (await res.json()) as ApplyJobResponse | { error?: string };
		if (!res.ok) {
			const msg =
				typeof (data as { error?: string }).error === "string"
					? (data as { error: string }).error
					: `HTTP ${res.status}`;
			return { error: msg };
		}
		return { data: data as ApplyJobResponse };
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		return { error: `Request failed: ${message}` };
	}
}

/**
 * POST /applications/:id/missing-fields — log missing required fields for an application.
 */
export async function reportMissingFields(
	jobApplicationId: string,
	missingFields: string[],
): Promise<void> {
	if (missingFields.length === 0) return;
	const baseUrl = await getBackendUrl();
	const url = `${baseUrl.replace(/\/$/, "")}/applications/${encodeURIComponent(jobApplicationId)}/missing-fields`;
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	const token = await getToken();
	if (token) headers["Authorization"] = `Bearer ${token}`;
	try {
		await fetch(url, {
			method: "POST",
			headers,
			body: JSON.stringify({ missingFields }),
		});
	} catch {
		// Best-effort logging; ignore errors
	}
}
