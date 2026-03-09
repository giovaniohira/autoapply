import type { LocationPreference, RoleType } from "./compatibility.js";

/**
 * User job search filters: role, techs, location, experience range.
 */
export interface JobFilters {
	role?: RoleType | null;
	technologies?: string[] | null;
	location?: LocationPreference | null;
	minExperience?: number | null;
	maxExperience?: number | null;
}
