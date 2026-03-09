import type {
	CompatibilityBreakdown,
	CompatibilityScore,
	JobPayload,
	LocationPreference,
} from "@autoapply/shared";
import type { User, UserSkill } from "@autoapply/shared";
import { COMPATIBILITY_WEIGHTS } from "@autoapply/shared";

export interface ScoringInput {
	user: User;
	userSkills: UserSkill[];
	job: JobPayload;
}

/**
 * Experience: reject (0) if required_years - user_years >= 2; else proportional.
 */
function scoreExperience(
	userYears: number,
	requiredYears: number | undefined,
): number {
	if (requiredYears === undefined || requiredYears === 0) return 100;
	const gap = requiredYears - userYears;
	if (gap >= 2) return 0;
	if (userYears >= requiredYears) return 100;
	return Math.round((userYears / requiredYears) * 100);
}

/**
 * Technology: intersection of job_technologies × user_technologies.
 */
function scoreTechnology(
	jobTechs: string[] | undefined,
	userSkills: UserSkill[],
): number {
	if (!jobTechs?.length) return 100;
	const userTechSet = new Set(
		userSkills.map((s) => s.skill.trim().toLowerCase()),
	);
	const matchCount = jobTechs.filter((t) =>
		userTechSet.has(t.trim().toLowerCase()),
	).length;
	return Math.round((matchCount / jobTechs.length) * 100);
}

/**
 * Role: similarity via categories. No user role preference in schema yet; score by presence of role type.
 */
function scoreRole(_user: User, job: JobPayload): number {
	if (!job.roleType) return 100;
	return 100;
}

/**
 * Location: remote / country / city with distinct weights.
 */
function scoreLocation(
	userLocation: string | null,
	jobLocation: LocationPreference | undefined,
): number {
	if (!jobLocation) return 100;
	if (jobLocation.remote === true) return 100;
	if (!userLocation?.trim()) return 50;
	const ul = userLocation.toLowerCase();
	if (jobLocation.country && ul.includes(jobLocation.country.toLowerCase()))
		return 90;
	if (jobLocation.city && ul.includes(jobLocation.city.toLowerCase()))
		return 90;
	return 40;
}

/**
 * Additional: language, work authorization, certifications. No user fields yet; neutral when present.
 */
function scoreAdditional(job: JobPayload): number {
	if (!job.additionalRequirements?.length) return 100;
	return 50;
}

/**
 * Compute compatibility score (0–100) and optional per-criterion breakdown.
 */
export function computeCompatibility(
	input: ScoringInput,
	opts?: { includeBreakdown: boolean },
): CompatibilityScore {
	const { user, userSkills, job } = input;
	const experience = scoreExperience(
		user.yearsExperience,
		job.requiredYearsExperience,
	);
	const technology = scoreTechnology(job.technologies, userSkills);
	const role = scoreRole(user, job);
	const location = scoreLocation(user.location, job.location);
	const additional = scoreAdditional(job);

	const breakdown: CompatibilityBreakdown = {
		experience,
		technology,
		role,
		location,
		additional,
	};

	const score = Math.round(
		(experience * COMPATIBILITY_WEIGHTS.experience +
			technology * COMPATIBILITY_WEIGHTS.technology +
			role * COMPATIBILITY_WEIGHTS.role +
			location * COMPATIBILITY_WEIGHTS.location +
			additional * COMPATIBILITY_WEIGHTS.additional) /
			100,
	);
	const clamped = Math.max(0, Math.min(100, score));

	return {
		score: clamped,
		...(opts?.includeBreakdown && { breakdown }),
	};
}
