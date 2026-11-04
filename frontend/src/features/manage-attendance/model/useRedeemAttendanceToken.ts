import { useCallback, useState } from 'react';
import type { RedeemAttendanceTokenResult } from '@/entities/attendance';
import { attendanceApi } from '../api/attendanceApi';
import {
  formatRedeemSuccessMessage,
  isValidAttendanceCode,
  normalizeAttendanceCode,
  redeemTokenErrorMessage,
} from './redeemAttendanceToken';

const RECENT_KEY = 'edusmart.attendance.redeem.recent';
const RECENT_LIMIT = 5;

export type RedeemRecentItem = {
  code: string;
  offeringName: string;
  groupName: string;
  sessionDate: string;
  registeredAt: string;
  alreadyRedeemed: boolean;
};

function readRecent(): RedeemRecentItem[] {
  try {
    const raw = sessionStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RedeemRecentItem[];
    return Array.isArray(parsed) ? parsed.slice(0, RECENT_LIMIT) : [];
  } catch {
    return [];
  }
}

function pushRecent(item: RedeemRecentItem): RedeemRecentItem[] {
  const next = [
    item,
    ...readRecent().filter(
      (row) =>
        !(
          row.sessionDate === item.sessionDate &&
          row.offeringName === item.offeringName &&
          row.groupName === item.groupName
        ),
    ),
  ].slice(0, RECENT_LIMIT);
  try {
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  return next;
}

export function useRedeemAttendanceToken() {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSuccess, setLastSuccess] =
    useState<RedeemAttendanceTokenResult | null>(null);
  const [recent, setRecent] = useState<RedeemRecentItem[]>(() => readRecent());

  const onCodeChange = useCallback((value: string) => {
    setCode(normalizeAttendanceCode(value));
    setError(null);
  }, []);

  const submit = useCallback(async (): Promise<
    | { ok: true; result: RedeemAttendanceTokenResult }
    | { ok: false; error: string }
  > => {
    const normalized = normalizeAttendanceCode(code);
    if (!isValidAttendanceCode(normalized)) {
      const message = 'Ingresa un código válido (6–16 letras o números).';
      setError(message);
      return { ok: false, error: message };
    }

    setSubmitting(true);
    setError(null);
    try {
      const result = await attendanceApi.redeemAttendanceToken({
        code: normalized,
      });
      setLastSuccess(result);
      setRecent(
        pushRecent({
          code: normalized,
          offeringName: result.offeringName,
          groupName: result.groupName,
          sessionDate: result.sessionDate,
          registeredAt: result.registeredAt,
          alreadyRedeemed: result.alreadyRedeemed,
        }),
      );
      setCode('');
      return { ok: true, result };
    } catch (reason) {
      const message = redeemTokenErrorMessage(reason);
      setError(message);
      return { ok: false, error: message };
    } finally {
      setSubmitting(false);
    }
  }, [code]);

  return {
    code,
    onCodeChange,
    submitting,
    error,
    lastSuccess,
    recent,
    successMessage: lastSuccess
      ? formatRedeemSuccessMessage(lastSuccess)
      : null,
    canSubmit:
      isValidAttendanceCode(normalizeAttendanceCode(code)) && !submitting,
    submit,
  };
}
