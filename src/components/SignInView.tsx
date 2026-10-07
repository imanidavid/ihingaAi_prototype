import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Sprout,
  ShieldCheck,
  ChevronDown,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Clock,
  ArrowLeft,
  Users,
} from 'lucide-react';
import heroImg from '../assets/images/musanze_terraced_hero_1790594273190.jpg';
import { AppRole, UserAccount, AccessRequest } from '../types';
import {
  SIGN_IN_TRANSLATIONS,
  SignInLanguage,
} from '../translations/signInTranslations';
import { VerificationCodeInput } from './auth/VerificationCodeInput';
import { SignUpWizard } from './auth/SignUpWizard';
import { ForgotPasswordWizard } from './auth/ForgotPasswordWizard';

interface SignInViewProps {
  onSignInSuccess: (role: AppRole, account?: UserAccount) => void;
  accounts?: UserAccount[];
  accessRequests?: AccessRequest[];
  onAddNewAccount?: (account: UserAccount) => void;
  onAddAccessRequest?: (account: UserAccount, request: AccessRequest) => void;
  initialLanguage?: SignInLanguage;
}

export type AuthMode = 'sign_in' | 'two_step' | 'sign_up' | 'forgot_password' | 'waiting_approval';

export const SignInView: React.FC<SignInViewProps> = ({
  onSignInSuccess,
  accounts = [],
  accessRequests = [],
  onAddNewAccount = () => {},
  onAddAccessRequest = () => {},
  initialLanguage = 'en',
}) => {
  const [lang, setLang] = useState<SignInLanguage>(initialLanguage);
  const [authMode, setAuthMode] = useState<AuthMode>('sign_in');
  const t = SIGN_IN_TRANSLATIONS[lang];

  // Sign-in form inputs
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Demo accounts panel collapsed state
  const [isDemoPanelOpen, setIsDemoPanelOpen] = useState(true);

  // Pending applicant info for 'waiting_approval' mode
  const [pendingApplicant, setPendingApplicant] = useState<{
    fullName: string;
    role: string;
    contact: string;
  } | null>(null);

  // Handle Fill from Demo Account panel
  const handleSelectDemoAccount = (targetRole: 'farmer' | 'officer' | 'cooperative') => {
    setErrorMessage(null);
    if (targetRole === 'farmer') {
      setIdentifier('+250 788 000 012');
      setPassword('demo1234');
    } else if (targetRole === 'officer') {
      setIdentifier('claudine.m@ihinga.demo');
      setPassword('demo1234');
    } else {
      setIdentifier('+250 788 000 034');
      setPassword('demo1234');
    }
  };

  // Resolve role and account match from input
  const resolveAccount = (
    inputIdentifier: string
  ): { role: AppRole | 'pending_role'; account?: UserAccount } | null => {
    const clean = inputIdentifier.trim().toLowerCase();
    const cleanDigits = clean.replace(/\D/g, '');

    // 1. Check custom accounts list in store
    const matched = accounts.find((acc) => {
      const accDigits = acc.phone.replace(/\D/g, '');
      const phoneMatch = cleanDigits.length >= 6 && accDigits.endsWith(cleanDigits);
      const emailMatch = !!acc.email && acc.email.toLowerCase() === clean;
      return phoneMatch || emailMatch;
    });

    if (matched) {
      if (matched.status === 'pending') {
        return { role: 'pending_role', account: matched };
      }
      if (matched.role === 'cooperative_leader') {
        return { role: 'cooperative', account: matched };
      }
      return { role: matched.role === 'officer' ? 'officer' : 'farmer', account: matched };
    }

    // 2. Check initial demo accounts fallback
    if (
      clean.includes('788') ||
      clean.includes('000012') ||
      clean.includes('farmer') ||
      clean.includes('jean') ||
      clean.includes('baptiste')
    ) {
      return { role: 'farmer' };
    }

    if (
      clean.includes('000034') ||
      clean.includes('034') ||
      clean.includes('aline') ||
      clean.includes('uwimana') ||
      clean.includes('coop') ||
      clean.includes('musanzepotato')
    ) {
      return { role: 'cooperative' };
    }

    if (
      clean.includes('claudine') ||
      clean.includes('officer') ||
      clean.includes('ihinga.demo') ||
      clean.includes('rab') ||
      clean.includes('agri')
    ) {
      return { role: 'officer' };
    }

    return null;
  };

  // Handle Submit Sign-in Form
  const handleSubmitSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (failedAttempts >= 5) {
      setErrorMessage(t.errorTooManyAttempts);
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const resolution = resolveAccount(identifier);

      // Check if account is in 'pending' status
      if (resolution && resolution.role === 'pending_role') {
        setPendingApplicant({
          fullName: resolution.account?.fullName || identifier,
          role: resolution.account?.role || 'Staff',
          contact: resolution.account?.email || resolution.account?.phone || identifier,
        });
        setAuthMode('waiting_approval');
        return;
      }

      const isValidPassword = password.trim() === 'demo1234' || password.trim().length >= 4;

      if (!resolution || !isValidPassword) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          setErrorMessage(t.errorTooManyAttempts);
        } else {
          setErrorMessage(t.errorIncorrect);
        }
        return;
      }

      // Valid credentials
      if (resolution.role === 'officer') {
        // Agricultural officers require two-step verification
        setAuthMode('two_step');
      } else if (resolution.role === 'cooperative') {
        // Cooperative leaders sign in to cooperative dashboard
        onSignInSuccess('cooperative', resolution.account);
      } else {
        // Farmers sign directly in
        onSignInSuccess('farmer', resolution.account);
      }
    }, 350);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F4F6EF] text-[#17271D]">
      {/* ========================================================================= */}
      {/* LEFT 45% PANEL: Forest Green Hero Banner Style */}
      {/* ========================================================================= */}
      <div className="lg:w-[45%] bg-[#1F4A34] text-white flex flex-col justify-between p-8 md:p-12 lg:p-16 relative overflow-hidden flex-shrink-0">
        {/* Background photo of Musanze volcanic terraces fading into rich green */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImg}
            alt="Musanze District volcanic terraces"
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1F4A34] via-[#1F4A34]/90 to-transparent" />
          <div className="absolute inset-0 bg-radial from-transparent to-[#1F4A34]/70" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E4ECDB] flex items-center justify-center shadow-xs flex-shrink-0">
              <Sprout className="w-5 h-5 text-[#1F4A34]" strokeWidth={2.25} />
            </div>
            <div className="flex flex-col">
              <span className="text-[17px] font-bold tracking-tight text-white leading-tight">
                IHINGA AI
              </span>
              <span className="text-[11px] text-[#E4ECDB] font-medium">
                Musanze District
              </span>
            </div>
          </div>
        </div>

        {/* Hero Heading and Subheading */}
        <div className="relative z-10 space-y-4 my-auto py-12 lg:py-0">
          <h1 className="text-[30px] md:text-[36px] font-bold tracking-tight text-white leading-tight max-w-md">
            {t.heroHeading}
          </h1>
          <p className="text-[14px] text-[#E4ECDB] leading-relaxed max-w-sm font-normal">
            {t.heroSubheading}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between text-[11px] text-[#E4ECDB]/80">
          <span>Prototype · Season 2026/27 A</span>
          <span>Northern Province</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT 55% PANEL: Auth Forms & Language Switcher */}
      {/* ========================================================================= */}
      <div className="lg:w-[55%] flex-1 flex flex-col justify-between p-6 md:p-10 lg:p-12 relative overflow-y-auto">
        {/* Top-Right Language Toggle */}
        <div className="flex justify-end mb-6">
          <div className="inline-flex p-1 rounded-full bg-[#E4ECDB]/60 border border-[rgba(31,74,52,0.12)]">
            <button
              type="button"
              onClick={() => setLang('rw')}
              className={`px-3.5 py-1 rounded-full text-[11.5px] font-medium transition-all cursor-pointer ${
                lang === 'rw'
                  ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
                  : 'text-[#5B665E] hover:text-[#17271D]'
              }`}
            >
              Kinyarwanda
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-3.5 py-1 rounded-full text-[11.5px] font-medium transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
                  : 'text-[#5B665E] hover:text-[#17271D]'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* SUB-VIEW 1: SIGN IN FORM */}
        {/* ======================================================================= */}
        {authMode === 'sign_in' && (
          <div className="max-w-[420px] w-full mx-auto my-auto space-y-6">
            <div className="bg-[#FBFCF8] rounded-[20px] p-7 md:p-8 border border-[rgba(31,74,52,0.12)] shadow-[0_4px_24px_rgba(31,74,52,0.06)] space-y-6">
              <div>
                <h2 className="text-[22px] font-bold text-[#17271D] tracking-tight">
                  {t.signInButton}
                </h2>
                <p className="text-[12.5px] text-[#5B665E] mt-1">
                  Access your climate risk dashboard and farm records
                </p>
              </div>

              {/* Inline Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmitSignIn} className="space-y-4 text-[12.5px]">
                {/* Phone or Email */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-[#17271D] block">
                    {t.phoneOrEmailLabel}
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={t.phoneOrEmailPlaceholder}
                    disabled={failedAttempts >= 5}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[13px] placeholder:text-[#5B665E]/60 focus:outline-hidden focus:border-[#1F4A34] transition-colors"
                    required
                  />
                </div>

                {/* Password with Eye Toggle */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[#17271D]">
                      {t.passwordLabel}
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot_password')}
                      className="text-[11.5px] text-[#1F4A34] hover:underline font-medium cursor-pointer"
                    >
                      {t.forgotPassword}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      disabled={failedAttempts >= 5}
                      className="w-full py-2.5 pl-3.5 pr-10 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[13px] placeholder:text-[#5B665E]/60 focus:outline-hidden focus:border-[#1F4A34] transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B665E] hover:text-[#17271D] p-1 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading || failedAttempts >= 5}
                  className="w-full py-3 px-4 rounded-full bg-[#1F4A34] text-white text-[13px] font-semibold hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
                >
                  {isLoading ? <span>{t.signingIn}</span> : <span>{t.signInButton}</span>}
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Create Account link -> opens Sign Up */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode('sign_up')}
                    className="text-[12px] text-[#5B665E] hover:text-[#1F4A34] font-medium cursor-pointer hover:underline"
                  >
                    {t.createAccount}
                  </button>
                </div>
              </form>
            </div>

            {/* DEMO ACCOUNTS PANEL (Below card, collapsible) */}
            <div className="bg-[#FBFCF8]/80 rounded-[16px] border border-[rgba(31,74,52,0.10)] p-4 space-y-3">
              <button
                type="button"
                onClick={() => setIsDemoPanelOpen(!isDemoPanelOpen)}
                className="w-full flex items-center justify-between text-left text-[12px] font-semibold text-[#17271D] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1F4A34]" strokeWidth={1.75} />
                  <span>{t.demoAccountsTitle}</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#5B665E] transition-transform duration-200 ${
                    isDemoPanelOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isDemoPanelOpen && (
                <div className="space-y-2 pt-1 border-t border-[rgba(31,74,52,0.06)] animate-in fade-in duration-200 text-[11.5px]">
                  {/* Farmer row */}
                  <div
                    onClick={() => handleSelectDemoAccount('farmer')}
                    className="p-2.5 rounded-xl bg-white hover:bg-[#E4ECDB]/40 border border-[rgba(31,74,52,0.08)] cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#E4ECDB] flex items-center justify-center flex-shrink-0 text-[#1F4A34]">
                        <Sprout className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#17271D] group-hover:text-[#1F4A34]">
                          {t.farmerRole} — {t.farmerName}
                        </div>
                        <div className="text-[10.5px] text-[#5B665E]">
                          +250 788 000 012 · demo1234
                        </div>
                      </div>
                    </div>
                    <span className="text-[10.5px] text-[#1F4A34] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Fill
                    </span>
                  </div>

                  {/* Officer row */}
                  <div
                    onClick={() => handleSelectDemoAccount('officer')}
                    className="p-2.5 rounded-xl bg-white hover:bg-[#E4ECDB]/40 border border-[rgba(31,74,52,0.08)] cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#1F4A34] flex items-center justify-center flex-shrink-0 text-white">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#17271D] group-hover:text-[#1F4A34]">
                          {t.officerRole} — {t.officerName}
                        </div>
                        <div className="text-[10.5px] text-[#5B665E]">
                          claudine.m@ihinga.demo · demo1234
                        </div>
                      </div>
                    </div>
                    <span className="text-[10.5px] text-[#1F4A34] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Fill
                    </span>
                  </div>

                  {/* Cooperative leader row */}
                  <div
                    onClick={() => handleSelectDemoAccount('cooperative')}
                    className="p-2.5 rounded-xl bg-white hover:bg-[#E4ECDB]/40 border border-[rgba(31,74,52,0.08)] cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#E4ECDB] flex items-center justify-center flex-shrink-0 text-[#1F4A34]">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-[#17271D] group-hover:text-[#1F4A34]">
                          {t.coopRole} — {t.coopLeaderName || 'Aline Uwimana'}
                        </div>
                        <div className="text-[10.5px] text-[#5B665E]">
                          +250 788 000 034 · demo1234
                        </div>
                      </div>
                    </div>
                    <span className="text-[10.5px] text-[#1F4A34] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Fill
                    </span>
                  </div>

                  {/* Disabled future roles */}
                  <div className="p-2.5 rounded-xl bg-[#F4F6EF]/50 border border-[rgba(31,74,52,0.06)] opacity-60 flex items-center justify-between">
                    <div className="text-[11px] text-[#5B665E]">
                      <span>{t.researcherRole} · {t.adminRole}</span>
                    </div>
                    <span className="text-[10px] text-[#5B665E] font-medium italic">
                      {t.designedInNextIteration}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* SUB-VIEW 2: TWO-STEP VERIFICATION (FOR OFFICER) */}
        {/* ======================================================================= */}
        {authMode === 'two_step' && (
          <div className="max-w-[420px] w-full mx-auto my-auto space-y-6">
            <div className="bg-[#FBFCF8] rounded-[20px] p-7 md:p-8 border border-[rgba(31,74,52,0.12)] shadow-[0_4px_24px_rgba(31,74,52,0.06)] space-y-6">
              <div className="space-y-1">
                <div className="w-10 h-10 rounded-full bg-[#E4ECDB] flex items-center justify-center text-[#1F4A34] mb-3">
                  <KeyRound className="w-5 h-5" strokeWidth={2} />
                </div>
                <h2 className="text-[20px] font-bold text-[#17271D] tracking-tight">
                  {t.twoStepHeading}
                </h2>
                <p className="text-[12.5px] text-[#5B665E]">
                  {t.twoStepSubtitle}
                </p>
              </div>

              {/* Reusable Verification Code Input with Attempt Limiting & Never Revealing Code */}
              <VerificationCodeInput
                expectedCode="246810"
                demoHintCode="246810"
                destinationType="authenticator"
                lang={lang}
                buttonLabel={t.twoStepVerifyButton}
                onSuccess={() => onSignInSuccess('officer')}
              />

              <div className="text-center pt-1 border-t border-[rgba(31,74,52,0.06)]">
                <button
                  type="button"
                  onClick={() => setAuthMode('sign_in')}
                  className="text-[12px] text-[#5B665E] hover:text-[#17271D] underline cursor-pointer"
                >
                  {t.backToSignIn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* SUB-VIEW 3: SIGN UP WIZARD (Module 1, Part 2) */}
        {/* ======================================================================= */}
        {authMode === 'sign_up' && (
          <SignUpWizard
            lang={lang}
            onBackToSignIn={() => setAuthMode('sign_in')}
            onSignUpFarmerSuccess={(account) => {
              onAddNewAccount(account);
              onSignInSuccess('farmer', account);
            }}
            onRegisterAccessRequest={(account, request) => {
              onAddNewAccount(account);
              onAddAccessRequest(account, request);
            }}
          />
        )}

        {/* ======================================================================= */}
        {/* SUB-VIEW 4: FORGOT PASSWORD WIZARD */}
        {/* ======================================================================= */}
        {authMode === 'forgot_password' && (
          <ForgotPasswordWizard
            lang={lang}
            onBackToSignIn={() => setAuthMode('sign_in')}
            onPasswordResetSuccess={(ident, newPass) => {
              setIdentifier(ident);
              setPassword(newPass);
              setErrorMessage(null);
              setAuthMode('sign_in');
            }}
          />
        )}

        {/* ======================================================================= */}
        {/* SUB-VIEW 5: WAITING FOR APPROVAL (SHOWN FOR PENDING ACCOUNTS) */}
        {/* ======================================================================= */}
        {authMode === 'waiting_approval' && (
          <div className="max-w-[420px] w-full mx-auto my-auto space-y-6">
            <div className="bg-[#FBFCF8] rounded-[20px] p-7 md:p-8 border border-[rgba(31,74,52,0.12)] shadow-[0_4px_24px_rgba(31,74,52,0.06)] space-y-6 text-center">
              <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mx-auto shadow-xs">
                <Clock className="w-7 h-7 text-amber-700" strokeWidth={2} />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-[22px] font-bold text-[#17271D] tracking-tight">
                  {t.waitingApprovalTitle}
                </h2>
                <p className="text-[12.5px] text-[#5B665E] max-w-sm mx-auto leading-relaxed">
                  {t.waitingApprovalBody}
                </p>
              </div>

              {pendingApplicant && (
                <div className="p-4 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.08)] text-left text-[12px] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#5B665E]">Applicant:</span>
                    <span className="font-semibold text-[#17271D]">{pendingApplicant.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B665E]">Role:</span>
                    <span className="font-semibold text-[#17271D] capitalize">
                      {pendingApplicant.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B665E]">Contact:</span>
                    <span className="font-semibold text-[#17271D]">{pendingApplicant.contact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B665E]">Status:</span>
                    <span className="font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full text-[11px]">
                      Pending review
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setAuthMode('sign_in')}
                className="w-full py-3 px-5 rounded-full bg-[#1F4A34] text-white text-[13px] font-semibold hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.backToSignIn}</span>
              </button>
            </div>
          </div>
        )}

        {/* Quiet Bottom Attribution */}
        <div className="text-center pt-6 text-[11px] text-[#5B665E]">
          IHINGA AI · Musanze District · Rwanda
        </div>
      </div>
    </div>
  );
};
