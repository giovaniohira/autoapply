import { describe, expect, it } from "vitest";
import { parseYearsExperience, parseTechnologies } from "./parseDescription";

describe("parseYearsExperience", () => {
	it("extracts single number with plus (e.g. 5+ years)", () => {
		expect(parseYearsExperience("5+ years of experience")).toBe(5);
		expect(parseYearsExperience("3+ years experience")).toBe(3);
	});

	it("extracts number from range (e.g. 3-5 years)", () => {
		expect(parseYearsExperience("3-5 years of experience")).toBe(3);
	});

	it("returns undefined for empty or no match", () => {
		expect(parseYearsExperience("")).toBeUndefined();
		expect(parseYearsExperience("no numbers here")).toBeUndefined();
	});

	it("matches experience: N years pattern", () => {
		expect(parseYearsExperience("Experience: 7 years")).toBe(7);
	});
});

describe("parseTechnologies", () => {
	it("returns empty array for empty text", () => {
		expect(parseTechnologies("")).toEqual([]);
	});

	it("detects common tech keywords", () => {
		const text = "We use React, TypeScript and Node.js for our stack.";
		expect(parseTechnologies(text)).toContain("React");
		expect(parseTechnologies(text)).toContain("TypeScript");
		expect(parseTechnologies(text)).toContain("Node.js");
	});

	it("does not duplicate technologies", () => {
		const text = "React and React again";
		expect(parseTechnologies(text).filter((t) => t === "React")).toHaveLength(1);
	});
});
