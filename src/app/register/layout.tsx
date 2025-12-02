import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Affiliator Registration",
  description: "Create an affiliator account to generate referral links and coupon codes.",
};

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
