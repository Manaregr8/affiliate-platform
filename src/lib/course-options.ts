export type CourseCategory = string;

export type CourseCommissionSummary = {
	slug: string;
	name: string;
	affiliatorTokens: number;
	superAffiliatorTokens: number;
};

export type CourseCommissionLookup = Record<string, CourseCommissionSummary>;

export function formatCourseLabel(courseName?: string | null, category?: CourseCategory | null) {
	if (courseName) {
		return courseName;
	}

	if (category) {
		return `${category} (category)`;
	}

	return "Not assigned";
}

export function buildCommissionLookup(courses: CourseCommissionSummary[]): CourseCommissionLookup {
	return courses.reduce<CourseCommissionLookup>((acc, course) => {
		acc[course.slug] = course;
		return acc;
	}, {});
}

export function getLeadTokens(lookup: CourseCommissionLookup, courseSlug?: string | null) {
	if (!courseSlug) {
		return null;
	}

	return lookup[courseSlug] ?? null;
}
