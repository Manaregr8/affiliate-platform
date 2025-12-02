export const STUDENT_COURSE_OPTIONS = [
  "Digital Marketing",
  "Designing",
  "Development (software, web, games etc.)",
  "Video Editing",
  "Cyber Security",
  "Artificial Intelligence",
  "Data Analytics",
  "Data Science",
] as const;

export type StudentCourse = (typeof STUDENT_COURSE_OPTIONS)[number];
