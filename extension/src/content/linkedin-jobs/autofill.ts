/**
 * Autofill layer for LinkedIn Easy Apply form.
 * Fills text fields from user profile, dropdowns, and AI answers into text areas.
 * Uses random delays and human-like focus order for anti-detection.
 */

import type { AutofillProfile } from "../../types/api.js";
import {
	getEasyApplyForm,
	getEasyApplyFormFields,
	findFormInputByLabel,
	getEasyApplySubmitButton,
} from "./selectors.js";

/** Min/max delay in ms between actions (human-like typing/focus). */
const DELAY_MS_MIN = 80;
const DELAY_MS_MAX = 220;

/** Delay before starting autofill (let modal settle). */
const INITIAL_DELAY_MS = 400;

/**
 * Random delay in [min, max] ms.
 */
export function randomDelay(minMs = DELAY_MS_MIN, maxMs = DELAY_MS_MAX): Promise<void> {
	const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
	return new Promise((r) => setTimeout(r, ms));
}

/**
 * Set input value and dispatch input/change events so React/LinkedIn forms detect the change.
 */
function setInputValue(input: HTMLInputElement | HTMLTextAreaElement, value: string): void {
	const proto = Object.getPrototypeOf(input);
	const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
	if (setter) {
		setter.call(input, value);
	} else {
		(input as HTMLInputElement).value = value;
	}
	input.dispatchEvent(new Event("input", { bubbles: true }));
	input.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * Focus element with a short delay (human-like).
 */
async function focusWithDelay(el: HTMLElement): Promise<void> {
	await randomDelay(50, 120);
	el.focus();
}

/**
 * Fill a single text field; returns true if filled, false if missing value.
 */
async function fillTextField(
	container: Element,
	labels: string[],
	value: string | null | undefined,
): Promise<boolean> {
	if (value == null || String(value).trim() === "") return false;
	const input = findFormInputByLabel(container, labels);
	if (!input) return false;
	await focusWithDelay(input);
	await randomDelay();
	setInputValue(input, value.trim());
	return true;
}

/**
 * Match open-ended question by normalizing label/placeholder (for AI answers).
 */
function questionMatches(
	fieldLabelOrPlaceholder: string,
	question: string,
): boolean {
	const a = fieldLabelOrPlaceholder.toLowerCase().trim().replace(/\s+/g, " ");
	const b = question.toLowerCase().trim().replace(/\s+/g, " ");
	if (a.includes(b) || b.includes(a)) return true;
	// Short questions: match first few words
	const aWords = a.split(/\s+/).slice(0, 5).join(" ");
	const bWords = b.split(/\s+/).slice(0, 5).join(" ");
	return aWords.includes(bWords) || bWords.includes(aWords);
}

export interface AutofillResult {
	filled: string[];
	missing: string[];
}

/**
 * Run autofill: fixed fields from profile, then text areas from answers.
 * Uses human-like focus order and random delays.
 */
export async function runAutofill(
	profile: AutofillProfile | null,
	answers: Array<{ question: string; answer: string }>,
): Promise<AutofillResult> {
	const filled: string[] = [];
	const missing: string[] = [];

	const container = getEasyApplyForm();
	if (!container) {
		return { filled, missing };
	}

	await new Promise((r) => setTimeout(r, INITIAL_DELAY_MS));

	// Fixed fields in logical order (name, email, phone, location)
	if (profile) {
		const fields: { labels: string[]; value: string | null; name: string }[] = [
			{ labels: ["first name", "name", "full name", "nome"], value: profile.name, name: "name" },
			{ labels: ["email", "e-mail", "e-mail address"], value: profile.email, name: "email" },
			{ labels: ["phone", "phone number", "telephone", "mobile"], value: profile.phone, name: "phone" },
			{
				labels: ["location", "city", "country", "where are you located"],
				value: profile.location,
				name: "location",
			},
		];

		for (const { labels, value, name } of fields) {
			const ok = await fillTextField(container, labels, value);
			if (ok) filled.push(name);
			else if (value != null && String(value).trim() !== "") missing.push(name);
		}
	}

	const { textAreas } = getEasyApplyFormFields();
	for (const textarea of textAreas) {
		const placeholder = (textarea.placeholder ?? "").trim();
		const ariaLabel = (textarea.getAttribute("aria-label") ?? "").trim();
		const labelText = placeholder || ariaLabel || "";
		const match = answers.find((a) => questionMatches(labelText, a.question));
		if (match?.answer) {
			await focusWithDelay(textarea);
			await randomDelay();
			setInputValue(textarea, match.answer);
			filled.push(`answer:${labelText.slice(0, 30)}`);
		}
	}

	return { filled, missing };
}

/**
 * Get submit button; does not click it (user can submit manually or we add optional submit later).
 */
export function getSubmitButton(): HTMLButtonElement | null {
	return getEasyApplySubmitButton();
}

/**
 * Extract open-ended question texts from form text areas (for AI answer generation).
 */
export function getFormQuestions(): string[] {
	const container = getEasyApplyForm();
	if (!container) return [];
	const { textAreas } = getEasyApplyFormFields();
	const questions: string[] = [];
	for (const ta of textAreas) {
		const placeholder = (ta.placeholder ?? "").trim();
		const ariaLabel = (ta.getAttribute("aria-label") ?? "").trim();
		const name = (ta.name ?? "").trim();
		// Try to find associated label
		let labelText = placeholder || ariaLabel || name;
		if (!labelText && ta.id) {
			const label = container.querySelector(`label[for="${CSS.escape(ta.id)}"]`);
			if (label) labelText = (label.textContent ?? "").trim();
		}
		if (!labelText && ta.closest("label")) {
			labelText = (ta.closest("label")?.textContent ?? "").trim();
		}
		if (labelText) questions.push(labelText);
	}
	return questions;
}
