import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Check, RotateCcw } from 'lucide-react';
import { SIGN_IN_TRANSLATIONS, SignInLanguage } from '../../translations/signInTranslations';

interface VerificationCodeInputProps {
  expectedCode: string;
  demoHintCode: string;
  destinationMasked?: string;
  destinationType?: 'sms' | 'email' | 'authenticator';
  onSuccess: () => void;
  onResend?: () => void;
  lang?: SignInLanguage;
  buttonLabel?: string;
}

export const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  expectedCode,
  demoHintCode,
  destinationMasked,
  destinationType = 'sms',
  onSuccess,
  onResend,
  lang = 'en',
  buttonLabel,
}) => {
  const t = SIGN_IN_TRANSLATIONS[lang];
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [countdown, setCountdown] = useState(45);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // 45s countdown timer for resending
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Handle individual digit change
  const handleChange = (index: number, val: string) => {
    setErrorMessage(null);
    const cleaned = val.replace(/[^0-9]/g, '');
    const newDigits = [...digits];
    newDigits[index] = cleaned.slice(-1);
    setDigits(newDigits);

    // Auto-advance
    if (cleaned && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Support paste across all 6 boxes
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pasted) return;

    const newDigits = ['', '', '', '', '', ''];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    setErrorMessage(null);

    const nextIndex = Math.min(pasted.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  // Auto-fill demo code
  const handleAutoFill = () => {
    const codeChars = demoHintCode.split('').slice(0, 6);
    while (codeChars.length < 6) codeChars.push('');
    setDigits(codeChars);
    setErrorMessage(null);
    inputsRef.current[5]?.focus();
  };

  // Handle resend
  const handleTriggerResend = () => {
    setCountdown(45);
    setFailedAttempts(0);
    setDigits(['', '', '', '', '', '']);
    setErrorMessage(null);
    inputsRef.current[0]?.focus();
    onResend?.();
  };

  // Handle verification submit
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (failedAttempts >= 3) {
      setErrorMessage(t.codeTooManyAttemptsError);
      return;
    }

    const entered = digits.join('');
    if (entered.length < 6) {
      setErrorMessage(t.twoStepInvalidError);
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (entered === expectedCode) {
        onSuccess();
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 3) {
          setErrorMessage(t.codeTooManyAttemptsError);
        } else {
          setErrorMessage(t.twoStepInvalidError);
        }
      }
    }, 250);
  };

  const formatCountdown = (sec: number): string => {
    const s = sec < 10 ? `0${sec}` : `${sec}`;
    return `0:${s}`;
  };

  return (
    <form onSubmit={handleVerify} className="space-y-5">
      {/* Target notification caption */}
      {destinationMasked && (
        <div className="text-[12.5px] text-[#5B665E] pb-1">
          <span>
            {destinationType === 'sms'
              ? `${t.codeSentToSms} `
              : destinationType === 'email'
              ? `${t.codeSentToEmail} `
              : ''}
          </span>
          <span className="font-semibold text-[#17271D]">{destinationMasked}</span>
        </div>
      )}

      {/* Inline Error Message (Never reveals the correct code) */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <span className="leading-snug">{errorMessage}</span>
        </div>
      )}

      {/* 6 Digit Input Boxes with auto-advance and paste */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              inputsRef.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            autoFocus={idx === 0}
            className="w-11 h-13 sm:w-12 sm:h-14 text-center text-[22px] font-bold bg-white rounded-xl border border-[rgba(31,74,52,0.22)] text-[#17271D] focus:border-[#1F4A34] focus:ring-2 focus:ring-[#1F4A34]/20 focus:outline-hidden transition-all shadow-2xs"
          />
        ))}
      </div>

      {/* Resend code countdown / action */}
      {destinationType !== 'authenticator' && (
        <div className="flex items-center justify-between text-[12px]">
          {countdown > 0 ? (
            <span className="text-[#5B665E]">
              {t.resendCountdown} {formatCountdown(countdown)}
            </span>
          ) : (
            <button
              type="button"
              onClick={handleTriggerResend}
              className="text-[#1F4A34] hover:text-[#2C6343] font-semibold flex items-center gap-1 cursor-pointer hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resendButton}</span>
            </button>
          )}
        </div>
      )}

      {/* Muted Demo Hint Box below boxes, labeled "Demo code: XXX" */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.08)] text-[12px]">
        <span className="font-medium text-[#5B665E]">Demo code: {demoHintCode}</span>
        <button
          type="button"
          onClick={handleAutoFill}
          className="text-[#1F4A34] font-semibold underline hover:text-[#2C6343] cursor-pointer"
        >
          {t.autoFillButton}
        </button>
      </div>

      {/* Primary Submit Button */}
      <button
        type="submit"
        disabled={isVerifying || failedAttempts >= 3}
        className="w-full py-3 px-4 rounded-full bg-[#1F4A34] text-white text-[13px] font-semibold hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{buttonLabel || t.twoStepVerifyButton}</span>
        <Check className="w-4 h-4" />
      </button>
    </form>
  );
};
