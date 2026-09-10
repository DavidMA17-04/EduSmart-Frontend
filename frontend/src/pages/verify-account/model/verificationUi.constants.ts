/** UI mirrors of backend verification policy (backend remains authority). */
export const VERIFICATION_UI = {
  CODE_LENGTH: 6,
  /** Local UX-only resend cooldown; backend still enforces its own limits. */
  RESEND_COOLDOWN_MS: 60_000,
  TTL_HINT_MINUTES: 5,
} as const;
