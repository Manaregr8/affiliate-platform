import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Join as an Affiliator",
  description: "Sign up to receive your referral dashboard, coupon code, and payout tracking.",
};

export default function AffiliatorRegisterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
