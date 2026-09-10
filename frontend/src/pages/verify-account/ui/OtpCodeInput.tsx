import { useEffect, useId, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { sanitizeOtpDigits, setOtpDigit, clearOtpDigitAt } from '../model/otpCodeUtils';
import { VERIFICATION_UI } from '../model/verificationUi.constants';
import styles from './OtpCodeInput.module.css';

type OtpCodeInputProps = {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  'aria-describedby'?: string;
  autoFocus?: boolean;
};

export const OtpCodeInput = ({
  value,
  onChange,
  disabled = false,
  hasError = false,
  'aria-describedby': ariaDescribedBy,
  autoFocus = false,
}: OtpCodeInputProps) => {
  const length = VERIFICATION_UI.CODE_LENGTH;
  const groupId = useId();
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = sanitizeOtpDigits(value, length);

  useEffect(() => {
    if (!autoFocus || disabled) return;
    inputsRef.current[0]?.focus();
  }, [autoFocus, disabled]);

  const focusAt = (index: number) => {
    const el = inputsRef.current[Math.max(0, Math.min(index, length - 1))];
    el?.focus();
    el?.select();
  };

  const handleChange = (index: number, raw: string) => {
    const only = sanitizeOtpDigits(raw, length);
    if (only.length > 1) {
      // Mobile sometimes inserts full OTP into one field
      onChange(only.slice(0, length));
      focusAt(Math.min(only.length, length) - 1);
      return;
    }
    if (only.length === 1) {
      const { value: next, focusIndex } = setOtpDigit(digits, index, only, length);
      onChange(next);
      focusAt(focusIndex);
      return;
    }
    // Cleared via input event
    const { value: next, focusIndex } = clearOtpDigitAt(digits, index, length);
    onChange(next);
    focusAt(focusIndex);
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (digits[index]) {
        const { value: next, focusIndex } = clearOtpDigitAt(digits, index, length);
        onChange(next);
        focusAt(focusIndex);
      } else if (index > 0) {
        const { value: next, focusIndex } = clearOtpDigitAt(digits, index - 1, length);
        onChange(next);
        focusAt(focusIndex);
      }
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusAt(index - 1);
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusAt(index + 1);
      return;
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = sanitizeOtpDigits(event.clipboardData.getData('text'), length);
    if (!pasted) return;
    onChange(pasted);
    focusAt(Math.min(pasted.length, length) - 1);
  };

  return (
    <div
      aria-describedby={ariaDescribedBy}
      className={`${styles.group} ${hasError ? styles.groupError : ''}`}
      id={groupId}
      role="group"
      aria-label={`Código de verificación de ${length} dígitos`}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          aria-label={`Dígito ${index + 1} de ${length}`}
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          className={styles.cell}
          disabled={disabled}
          inputMode="numeric"
          maxLength={1}
          pattern="[0-9]*"
          type="text"
          value={digits[index] ?? ''}
          onChange={(event) => handleChange(index, event.target.value)}
          onFocus={(event) => event.currentTarget.select()}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
};

export { OTP_CODE_LENGTH } from '../model/otpCodeUtils';
