"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={toggleTheme}
      className="rounded-full border border-gray-300 bg-white/70 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm backdrop-blur transition hover:border-sky-400 hover:text-sky-700 dark:border-gray-600 dark:bg-gray-900/70 dark:text-gray-200 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}
