const TOPIC_VALUES = [
  "untouched_leads",
  "payout_issue",
  "technical_issue",
  "other",
] as const;

export const REPORT_TOPICS = TOPIC_VALUES.map((value) => {
  switch (value) {
    case "untouched_leads":
      return { value, label: "Leads untouched for too long" } as const;
    case "payout_issue":
      return { value, label: "Payout or token discrepancy" } as const;
    case "technical_issue":
      return { value, label: "Technical or dashboard issue" } as const;
    default:
      return { value, label: "Other" } as const;
  }
}) as ReadonlyArray<{ value: ReportTopic; label: string }>;

export type ReportTopic = (typeof TOPIC_VALUES)[number];

export const REPORT_TOPIC_VALUES = TOPIC_VALUES;
