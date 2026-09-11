import { useCallback, useEffect, useState } from 'react';
import { authApi } from '../api/authApi';
import { VERIFICATION_UI } from '@/pages/verify-account/model/verificationUi.constants';

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Shared send/resend/verify + local cooldown for OTP flows.
 * Does not auto-send; callers must invoke sendCode explicitly.
 */
export function useVerificationActions() {
  const [isSending, setIsSending] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (resendAvailableAt <= Date.now()) return;
    const id = window.setInterval(() => setNowMs(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [resendAvailableAt]);

  const startLocalCooldown = useCallback(() => {
    setResendAvailableAt(Date.now() + VERIFICATION_UI.RESEND_COOLDOWN_MS);
    setNowMs(Date.now());
  }, []);

  const resendSecondsLeft = Math.max(0, Math.ceil((resendAvailableAt - nowMs) / 1000));
  const canResend = resendSecondsLeft === 0 && !isResending && !isVerifying && !isSending;

  const sendCode = useCallback(async (email: string): Promise<string> => {
    setIsSending(true);
    try {
      const result = await authApi.resendVerification(email.trim().toLowerCase());
      startLocalCooldown();
      return result.message;
    } finally {
      setIsSending(false);
    }
  }, [startLocalCooldown]);

  const resendCode = useCallback(async (email: string): Promise<string> => {
    setIsResending(true);
    try {
      const result = await authApi.resendVerification(email.trim().toLowerCase());
      startLocalCooldown();
      return result.message;
    } finally {
      setIsResending(false);
    }
  }, [startLocalCooldown]);

  const verifyCode = useCallback(async (email: string, code: string): Promise<void> => {
    setIsVerifying(true);
    try {
      await authApi.verifyAccount(email.trim().toLowerCase(), code);
    } finally {
      setIsVerifying(false);
    }
  }, []);

  return {
    isSending,
    isResending,
    isVerifying,
    resendSecondsLeft,
    canResend,
    sendCode,
    resendCode,
    verifyCode,
    startLocalCooldown,
  };
}
