"use client";

import { useState } from "react";

type ReferralLinkCardProps = {
  referralCode: string;
  shareLinkOverride?: string;
  title?: string;
  helperText?: string;
};

export function ReferralLinkCard({ referralCode, shareLinkOverride, title, helperText }: ReferralLinkCardProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const shareLink = shareLinkOverride ?? `${baseUrl}/student/${referralCode}`;
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error("Failed to copy referral link", error);
      setCopied(false);
    }
  }
  return (
    <div className="h-full w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title ?? "Referral link"}
      </p>
      <a
        href={shareLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block w-full break-words text-sm font-semibold text-sky-600 hover:underline"
      >
        {shareLink}
      </a>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium transition hover:bg-sky-50
            ${copied ? "border-emerald-600 text-emerald-600 hover:bg-emerald-50" : "border-sky-600 text-sky-600"}`}
        >
          {copied ? "Copied!" : "Copy link"}
        </button>
        <span className="text-xs text-gray-500">
          {helperText ?? "Share this direct link to capture student leads."}
        </span>
      </div>
    </div>
  );
}
