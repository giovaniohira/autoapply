/**
 * Popup script: status, automation toggle, threshold, recent application count.
 */

import { STORAGE_KEYS, DEFAULTS } from "../background/storage.js";

async function main(): Promise<void> {
	const statusEl = document.getElementById("config-status");
	const automationToggle = document.getElementById("automation-toggle") as HTMLInputElement | null;
	const thresholdInput = document.getElementById("threshold-input") as HTMLInputElement | null;
	const recentCountEl = document.getElementById("recent-count");

	const [backend, userId, automation, threshold, timestamps] = await Promise.all([
		chrome.storage.local.get(STORAGE_KEYS.BACKEND_URL),
		chrome.storage.local.get(STORAGE_KEYS.USER_ID),
		chrome.storage.local.get(STORAGE_KEYS.AUTOMATION_ENABLED),
		chrome.storage.local.get(STORAGE_KEYS.DEFAULT_THRESHOLD),
		chrome.storage.local.get(STORAGE_KEYS.APPLY_TIMESTAMPS),
	]);

	const backendUrl =
		(backend[STORAGE_KEYS.BACKEND_URL] as string | undefined) || DEFAULTS.BACKEND_URL;
	const hasUser = !!userId[STORAGE_KEYS.USER_ID];
	if (statusEl) {
		statusEl.textContent = hasUser
			? `Backend: ${backendUrl} · User configured`
			: `Backend: ${backendUrl} · Set User ID to enable scoring`;
	}

	if (automationToggle) {
		automationToggle.checked =
			(automation[STORAGE_KEYS.AUTOMATION_ENABLED] as boolean | undefined) !== false;
		automationToggle.addEventListener("change", () => {
			chrome.storage.local.set({ [STORAGE_KEYS.AUTOMATION_ENABLED]: automationToggle.checked });
		});
	}
	if (thresholdInput) {
		const stored =
			(threshold[STORAGE_KEYS.DEFAULT_THRESHOLD] as number | undefined) ?? DEFAULTS.DEFAULT_THRESHOLD;
		thresholdInput.value = String(stored);
		thresholdInput.addEventListener("change", () => {
			const n = parseInt(thresholdInput.value, 10);
			if (!Number.isNaN(n) && n >= 0 && n <= 100) {
				chrome.storage.local.set({ [STORAGE_KEYS.DEFAULT_THRESHOLD]: n });
			}
		});
	}
	if (recentCountEl) {
		const raw = timestamps[STORAGE_KEYS.APPLY_TIMESTAMPS];
		const arr = Array.isArray(raw) ? (raw as string[]) : [];
		const windowStart = Date.now() - DEFAULTS.RATE_LIMIT_WINDOW_MS;
		const inLastHour = arr.filter((t) => new Date(t).getTime() > windowStart).length;
		recentCountEl.textContent = `Applications in last hour: ${inLastHour}`;
	}
}

main();
