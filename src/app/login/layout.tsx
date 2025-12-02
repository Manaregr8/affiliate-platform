import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Counsellors, affiliators, and supers can access their dashboards from here.",
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
