export const packKeys = ["provider", "summary", "price", "termination"] as const;

export type PackFieldKey = (typeof packKeys)[number];
export type PackPayload = Record<PackFieldKey, string>;
