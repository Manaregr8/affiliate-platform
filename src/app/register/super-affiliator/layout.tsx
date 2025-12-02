import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Super Affiliator Registration",
  description: "Create a supervising account to recruit affiliators and earn override commissions.",
};

export default function SuperAffiliatorRegisterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
