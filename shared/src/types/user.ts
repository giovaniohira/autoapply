/**
 * User — core profile for compatibility and autofill.
 */
export interface User {
	id: string;
	name: string;
	email: string;
	phone: string | null;
	location: string | null;
	yearsExperience: number;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * User skill with optional years of experience for that skill.
 */
export interface UserSkill {
	id: string;
	userId: string;
	skill: string;
	yearsExperience: number | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface UserWithSkills extends User {
	skills: UserSkill[];
}
