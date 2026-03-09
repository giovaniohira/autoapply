import { describe, expect, it } from "vitest";
import {
	COMPATIBILITY_WEIGHTS,
	DEFAULT_COMPATIBILITY_THRESHOLD,
} from "./compatibility";

describe("compatibility constants", () => {
	it("weights sum to 100", () => {
		const sum =
			COMPATIBILITY_WEIGHTS.experience +
			COMPATIBILITY_WEIGHTS.technology +
			COMPATIBILITY_WEIGHTS.role +
			COMPATIBILITY_WEIGHTS.location +
			COMPATIBILITY_WEIGHTS.additional;
		expect(sum).toBe(100);
	});

	it("default threshold is 60", () => {
		expect(DEFAULT_COMPATIBILITY_THRESHOLD).toBe(60);
	});
});
