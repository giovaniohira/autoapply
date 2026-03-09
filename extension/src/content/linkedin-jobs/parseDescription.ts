/**
 * Heuristic parsing of job description text for required years and technologies.
 * Used when structured DOM selectors are not available.
 */

/**
 * Try to extract required years of experience from text (e.g. "5+ years", "3-5 years").
 */
export function parseYearsExperience(text: string): number | undefined {
	if (!text || text.length === 0) return undefined;
	const patterns = [
		/(?:^|[\s(])(\d+)\s*-\s*\d+\s*years?\s*(?:of\s+)?(?:experience|exp)?/i,
		/(?:^|[\s(])(\d+)\s*[-+]?\s*years?\s*(?:of\s+)?(?:experience|exp)/i,
		/(?:experience|exp)[:\s]+(\d+)\s*[-+]?\s*years?/i,
		/(\d+)\s*[-+]?\s*years?\s*(?:experience|exp)/i,
	];
	for (const re of patterns) {
		const m = text.match(re);
		if (m) {
			const n = parseInt(m[1], 10);
			if (Number.isFinite(n)) return n;
		}
	}
	return undefined;
}

/** Common tech keywords to detect in job descriptions */
const TECH_KEYWORDS = [
	"JavaScript",
	"TypeScript",
	"React",
	"Node.js",
	"Python",
	"Java",
	"Go",
	"Rust",
	"C#",
	"SQL",
	"AWS",
	"Kubernetes",
	"Docker",
	"GraphQL",
	"REST",
	"PostgreSQL",
	"MongoDB",
	"Redis",
	"Git",
	"CI/CD",
	"Terraform",
	"GCP",
	"Azure",
];

/**
 * Extract technology mentions from job description text (simple word-boundary match).
 */
export function parseTechnologies(text: string): string[] {
	if (!text || text.length === 0) return [];
	const normalized = ` ${text} `;
	const found: string[] = [];
	for (const tech of TECH_KEYWORDS) {
		const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const re = new RegExp(`[\\s(]${escaped}[\\s),.]`, "i");
		if (re.test(normalized) && !found.includes(tech)) found.push(tech);
	}
	return found;
}
