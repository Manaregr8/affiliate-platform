"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type CourseCommissionOption = {
  slug: string;
  name: string;
  category: string;
};

interface StudentCourseSelectorProps {
  studentId: string;
  courseCategory: string;
  selectedSlug?: string | null;
  courses: CourseCommissionOption[];
}

export function StudentCourseSelector({ studentId, courseCategory, selectedSlug, courses }: StudentCourseSelectorProps) {
  const router = useRouter();
  const [value, setValue] = useState(selectedSlug ?? "");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setValue(selectedSlug ?? "");
  }, [selectedSlug]);

  const categoryCourses = courses.filter((course) => course.category === courseCategory);

  if (categoryCourses.length === 0) {
    return <span className="text-xs text-gray-500 dark:text-slate-400">No courses configured.</span>;
  }

  const handleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextValue = event.target.value;
    setValue(nextValue);
    setStatusMessage(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/lead/course", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentId, courseSlug: nextValue }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({ error: "Unable to save" }));
        throw new Error(result?.error ?? "Unable to save course assignment");
      }

      setStatusMessage("Course saved");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to assign course";
      setStatusMessage(message);
      setValue(selectedSlug ?? "");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-1">
      <select
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-700 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-[rgb(var(--border))] dark:bg-slate-900 dark:text-gray-100"
        value={value}
        onChange={handleChange}
        disabled={isSaving}
      >
        <option value="" disabled>
          Select course
        </option>
        {categoryCourses.map((course) => (
          <option key={course.slug} value={course.slug}>
            {course.name}
          </option>
        ))}
      </select>
      {statusMessage ? <p className="text-xs text-gray-500 dark:text-slate-400">{statusMessage}</p> : null}
    </div>
  );
}
