/**
 * Popup script: show status and config hint.
 */

import { STORAGE_KEYS, DEFAULTS } from "../background/storage.js";

async function main(): Promise<void> {
	const statusEl = document.getElementById("config-status");
	if (!statusEl) return;

	const [backend, userId] = await Promise.all([
		chrome.storage.local.get(STORAGE_KEYS.BACKEND_URL),
		chrome.storage.local.get(STORAGE_KEYS.USER_ID),
	]);

	const backendUrl =
		(backend[STORAGE_KEYS.BACKEND_URL] as string | undefined) || DEFAULTS.BACKEND_URL;
	const hasUser = !!userId[STORAGE_KEYS.USER_ID];

	if (hasUser) {
		statusEl.textContent = `Backend: ${backendUrl} · User configured`;
	} else {
		statusEl.textContent = `Backend: ${backendUrl} · Set User ID to enable scoring`;
	}
}

main();
