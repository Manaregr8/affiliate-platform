export const LEAD_STATUS_VALUES = ["untouched", "processing", "admitted"] as const;

export type LeadStatus = (typeof LEAD_STATUS_VALUES)[number];

const LEAD_STATUS_DISPLAY: Record<LeadStatus, { label: string; badgeClass: string }> = {
  untouched: {
    label: "Untouched",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200",
  },
  processing: {
    label: "Processing",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100",
  },
  admitted: {
    label: "Approved",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  },
};

export function normalizeLeadStatus(status: string): LeadStatus {
  if (LEAD_STATUS_VALUES.includes(status as LeadStatus)) {
    return status as LeadStatus;
  }
  return "untouched";
}

export function getLeadStatusDisplay(status: string) {
  const normalized = normalizeLeadStatus(status);
  return {
    value: normalized,
    ...LEAD_STATUS_DISPLAY[normalized],
  };
}
