import type { Metadata } from "next";
import type { ReactNode } from "react";

interface StudentReferralLayoutProps {
  children: ReactNode;
}

export async function generateMetadata({
  params,
}: {
  params: { referralCode: string };
}): Promise<Metadata> {
  const referralCode = params.referralCode.toUpperCase();

  return {
    title: `Apply via ${referralCode}`,
    description: "Submit your details so our counsellor can follow up on your referral.",
  };
}

export default function StudentReferralLayout({ children }: StudentReferralLayoutProps) {
  return <>{children}</>;
}
