import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import {
  SIGN_IN_TRANSLATIONS,
  SignInLanguage,
} from '../../translations/signInTranslations';
import {
  formatRwandaPhone,
  maskPhone,
  maskEmail,
} from '../../data/rwandaAdminData';
import { VerificationCodeInput } from './VerificationCodeInput';

interface ForgotPasswordWizardProps {
  lang: SignInLanguage;
  onBackToSignIn: () => void;
  onPasswordResetSuccess: (identifier: string, newPass: string) => void;
}

type ForgotStep = 'request' | 'verify' | 'new_password' | 'success';

export const ForgotPasswordWizard: React.FC<ForgotPasswordWizardProps> = ({
  lang,
  onBackToSignIn,
  onPasswordResetSuccess,
}) => {
  const t = SIGN_IN_TRANSLATIONS[lang];
  const [step, setStep] = useState<ForgotStep>('request');

  // Step 1: Identifier
  const [identifier, setIdentifier] = useState('');
  const [requestError, setRequestError] = useState<string | null>(null);

  // Step 3: New Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Password strength
  const passHasLength = newPassword.length >= 8;
  const passHasLetter = /[a-zA-Z]/.test(newPassword);
  const passHasNumber = /[0-9]/.test(newPassword);
  const passScore =
    (passHasLength ? 1 : 0) + (passHasLetter ? 1 : 0) + (passHasNumber ? 1 : 0);

  const getStrengthLabel = () => {
    if (!newPassword) return '';
    if (passScore === 3) return t.strengthStrong;
    if (passScore === 2) return t.strengthFair;
    return t.strengthWeak;
  };

  // Handle Step 1 submit: Send Code
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setRequestError('Please enter your phone number or email');
      return;
    }
    setRequestError(null);
    setStep('verify');
  };

  // Masked destination
  const destinationMasked = identifier.includes('@')
    ? maskEmail(identifier)
    : maskPhone(identifier);
  const destinationType = identifier.includes('@') ? 'email' : 'sms';

  // Handle Step 2 code verification success
  const handleCodeSuccess = () => {
    setStep('new_password');
  };

  // Handle Step 3 save new password
  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passHasLength || !passHasLetter || !passHasNumber) {
      setPasswordError('Password does not meet required strength criteria');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t.passwordsDoNotMatchError);
      return;
    }
    setPasswordError(null);
    onPasswordResetSuccess(identifier, newPassword);
    setStep('success');
  };

  return (
    <div className="max-w-[420px] w-full mx-auto my-auto space-y-6">
      <div className="bg-[#FBFCF8] rounded-[20px] p-6 sm:p-8 border border-[rgba(31,74,52,0.12)] shadow-[0_4px_24px_rgba(31,74,52,0.06)] space-y-6">
        {/* ===================================================================== */}
        {/* STEP 1: ENTER PHONE OR EMAIL */}
        {/* ===================================================================== */}
        {step === 'request' && (
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-full bg-[#E4ECDB] flex items-center justify-center text-[#1F4A34] mb-2">
                <KeyRound className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <h2 className="text-[20px] font-bold text-[#17271D] tracking-tight">
                {t.forgotPasswordTitle}
              </h2>
              <p className="text-[12px] text-[#5B665E] leading-relaxed">
                {t.forgotPasswordSubtitle}
              </p>
            </div>

            {requestError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>{requestError}</span>
              </div>
            )}

            <form onSubmit={handleSendCode} className="space-y-4 text-[12.5px]">
              <div className="space-y-1.5">
                <label className="font-semibold text-[#17271D] block">
                  {t.phoneOrEmailLabel}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setRequestError(null);
                    setIdentifier(e.target.value);
                  }}
                  placeholder={t.phoneOrEmailPlaceholder}
                  className="w-full py-2.5 px-3.5 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[13px] focus:outline-hidden focus:border-[#1F4A34]"
                  autoFocus
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-full bg-[#1F4A34] text-white text-[13px] font-semibold hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <span>{t.sendCodeButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 border-t border-[rgba(31,74,52,0.06)]">
                <button
                  type="button"
                  onClick={onBackToSignIn}
                  className="text-[12px] text-[#5B665E] hover:text-[#17271D] font-medium flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t.backToSignIn}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 2: ENTER VERIFICATION CODE (SAME REUSABLE COMPONENT) */}
        {/* ===================================================================== */}
        {step === 'verify' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[20px] font-bold text-[#17271D] tracking-tight">
                {t.verifyAccountTitle}
              </h2>
              <p className="text-[12px] text-[#5B665E] mt-0.5">
                {t.verifyAccountSubtitle}
              </p>
            </div>

            <VerificationCodeInput
              expectedCode="123456"
              demoHintCode="123456"
              destinationMasked={destinationMasked}
              destinationType={destinationType}
              lang={lang}
              buttonLabel={t.nextButton}
              onSuccess={handleCodeSuccess}
              onResend={() => {}}
            />

            <div className="text-center pt-1 border-t border-[rgba(31,74,52,0.06)]">
              <button
                type="button"
                onClick={() => setStep('request')}
                className="text-[12px] text-[#5B665E] hover:text-[#17271D] font-medium flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.backButton}</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 3: CREATE NEW PASSWORD */}
        {/* ===================================================================== */}
        {step === 'new_password' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[20px] font-bold text-[#17271D] tracking-tight">
                {t.resetPasswordTitle}
              </h2>
              <p className="text-[12px] text-[#5B665E] mt-0.5">
                {t.resetPasswordSubtitle}
              </p>
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4 text-[12.5px]">
              {/* New Password */}
              <div className="space-y-1">
                <label className="font-semibold text-[#17271D] block">
                  {t.createPasswordLabel} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setPasswordError(null);
                      setNewPassword(e.target.value);
                    }}
                    placeholder={t.passwordPlaceholder}
                    className="w-full py-2.5 pl-3.5 pr-10 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[13px] focus:outline-hidden focus:border-[#1F4A34]"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B665E] hover:text-[#17271D] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Strength bar */}
              {newPassword && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5B665E]">{t.passwordStrengthLabel}</span>
                    <span
                      className={`font-semibold ${
                        passScore === 3
                          ? 'text-[#1F4A34]'
                          : passScore === 2
                          ? 'text-amber-700'
                          : 'text-red-600'
                      }`}
                    >
                      {getStrengthLabel()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 h-1.5 w-full">
                    <div
                      className={`rounded-full h-full ${
                        passScore >= 1
                          ? passScore === 1
                            ? 'bg-red-500'
                            : passScore === 2
                            ? 'bg-amber-500'
                            : 'bg-[#1F4A34]'
                          : 'bg-gray-200'
                      }`}
                    />
                    <div
                      className={`rounded-full h-full ${
                        passScore >= 2
                          ? passScore === 2
                            ? 'bg-amber-500'
                            : 'bg-[#1F4A34]'
                          : 'bg-gray-200'
                      }`}
                    />
                    <div
                      className={`rounded-full h-full ${
                        passScore === 3 ? 'bg-[#1F4A34]' : 'bg-gray-200'
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Live Checklist */}
              <div className="p-3 rounded-xl bg-[#F4F6EF]/70 border border-[rgba(31,74,52,0.08)] space-y-1.5 text-[11.5px]">
                <div
                  className={`flex items-center gap-2 ${
                    passHasLength ? 'text-[#1F4A34] font-medium' : 'text-[#5B665E]'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      passHasLength ? 'bg-[#1F4A34] text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    ✓
                  </div>
                  <span>{t.checkLength}</span>
                </div>

                <div
                  className={`flex items-center gap-2 ${
                    passHasLetter ? 'text-[#1F4A34] font-medium' : 'text-[#5B665E]'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      passHasLetter ? 'bg-[#1F4A34] text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    ✓
                  </div>
                  <span>{t.checkLetter}</span>
                </div>

                <div
                  className={`flex items-center gap-2 ${
                    passHasNumber ? 'text-[#1F4A34] font-medium' : 'text-[#5B665E]'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                      passHasNumber ? 'bg-[#1F4A34] text-white' : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    ✓
                  </div>
                  <span>{t.checkNumber}</span>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="font-semibold text-[#17271D] block">
                  {t.confirmPasswordLabel} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setPasswordError(null);
                      setConfirmPassword(e.target.value);
                    }}
                    placeholder={t.confirmPasswordPlaceholder}
                    className="w-full py-2.5 pl-3.5 pr-10 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[13px] focus:outline-hidden focus:border-[#1F4A34]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B665E] hover:text-[#17271D] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-full bg-[#1F4A34] text-white text-[13px] font-semibold hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <span>{t.saveNewPasswordButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 4: PASSWORD CHANGED SUCCESS */}
        {/* ===================================================================== */}
        {step === 'success' && (
          <div className="space-y-6 text-center py-2">
            <div className="w-14 h-14 rounded-full bg-[#E4ECDB] flex items-center justify-center text-[#1F4A34] mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8 text-[#3E8E55]" strokeWidth={2.2} />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-[22px] font-bold text-[#17271D] tracking-tight">
                {t.passwordChangedTitle}
              </h2>
              <p className="text-[12.5px] text-[#5B665E] max-w-sm mx-auto leading-relaxed">
                {t.passwordChangedBody}
              </p>
            </div>

            <button
              type="button"
              onClick={onBackToSignIn}
              className="w-full py-3 px-5 rounded-full bg-[#1F4A34] text-white text-[13px] font-semibold hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <span>{t.signInButton}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
