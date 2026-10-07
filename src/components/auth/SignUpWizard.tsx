import React, { useState, useMemo } from 'react';
import {
  Sprout,
  Users,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  Clock,
  Building,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  SignUpRole,
  UserAccount,
  AccessRequest,
} from '../../types';
import {
  SIGN_IN_TRANSLATIONS,
  SignInLanguage,
} from '../../translations/signInTranslations';
import {
  RWANDA_DISTRICTS,
  getSectorsForDistrict,
  getCellsForSector,
  CROP_OPTIONS,
  COOPERATIVE_OPTIONS,
  formatRwandaPhone,
  validateRwandaPhone,
  maskPhone,
  maskEmail,
} from '../../data/rwandaAdminData';
import { VerificationCodeInput } from './VerificationCodeInput';

interface SignUpWizardProps {
  lang: SignInLanguage;
  onBackToSignIn: () => void;
  onSignUpFarmerSuccess: (account: UserAccount) => void;
  onRegisterAccessRequest: (account: UserAccount, request: AccessRequest) => void;
}

type SignUpStep = 1 | 2 | 3 | 4 | 5 | 6; // 6 is completion

export const SignUpWizard: React.FC<SignUpWizardProps> = ({
  lang,
  onBackToSignIn,
  onSignUpFarmerSuccess,
  onRegisterAccessRequest,
}) => {
  const t = SIGN_IN_TRANSLATIONS[lang];
  const [currentStep, setCurrentStep] = useState<SignUpStep>(1);

  // Step 1: Role
  const [role, setRole] = useState<SignUpRole>('farmer');

  // Step 2: Details
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+250 ');
  const [email, setEmail] = useState('');
  const [district, setDistrict] = useState('Musanze');
  const [preferredLang, setPreferredLang] = useState<'rw' | 'en'>(lang);

  // Step 3: Role-specific details
  // Farmer
  const [sector, setSector] = useState('Kinigi');
  const [cell, setCell] = useState('Kaguhu');
  const [farmSizeHa, setFarmSizeHa] = useState('0.8');
  const [cropsGrown, setCropsGrown] = useState<string[]>([
    'Irish Potato',
    'Climbing Beans',
    'Maize',
  ]);
  const [cooperative, setCooperative] = useState('None / Individual');

  // Cooperative Leader
  const [coopName, setCoopName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [coopSector, setCoopSector] = useState('Kinigi');
  const [membersCount, setMembersCount] = useState('120');

  // Agricultural Officer
  const [districtOfAssignment, setDistrictOfAssignment] = useState('Musanze');
  const [staffId, setStaffId] = useState('');
  const [officePhone, setOfficePhone] = useState('');

  // Researcher
  const [institution, setInstitution] = useState('');
  const [researchArea, setResearchArea] = useState('');

  // Step 4: Password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Validation errors per step
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  // Dynamic sector & cell options
  const sectorOptions = useMemo(() => getSectorsForDistrict(district), [district]);
  const cellOptions = useMemo(() => getCellsForSector(sector), [sector]);

  // When district changes, update default sector
  const handleDistrictChange = (newDistrict: string) => {
    setDistrict(newDistrict);
    const availableSectors = getSectorsForDistrict(newDistrict);
    if (availableSectors.length > 0) {
      setSector(availableSectors[0]);
      const availableCells = getCellsForSector(availableSectors[0]);
      setCell(availableCells[0] || 'Cell 1');
    }
  };

  // When sector changes, update default cell
  const handleSectorChange = (newSector: string) => {
    setSector(newSector);
    const availableCells = getCellsForSector(newSector);
    setCell(availableCells[0] || 'Cell 1');
  };

  // Toggle crop chip
  const handleToggleCrop = (cropName: string) => {
    if (cropsGrown.includes(cropName)) {
      if (cropsGrown.length > 1) {
        setCropsGrown(cropsGrown.filter((c) => c !== cropName));
      }
    } else {
      setCropsGrown([...cropsGrown, cropName]);
    }
  };

  // Password strength calculations
  const passHasLength = password.length >= 8;
  const passHasLetter = /[a-zA-Z]/.test(password);
  const passHasNumber = /[0-9]/.test(password);
  const passScore =
    (passHasLength ? 1 : 0) + (passHasLetter ? 1 : 0) + (passHasNumber ? 1 : 0);

  const getPasswordStrengthLabel = () => {
    if (!password) return '';
    if (passScore === 3) return t.strengthStrong;
    if (passScore === 2) return t.strengthFair;
    return t.strengthWeak;
  };

  // Step validation
  const validateStep2 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) {
      errors.fullName = t.nameRequiredError;
    }
    if (!validateRwandaPhone(phone)) {
      errors.phone = t.phoneInvalidError;
    }
    if (role !== 'farmer') {
      if (!email.trim() || !email.includes('@')) {
        errors.email = t.emailInvalidError;
      }
    } else if (email.trim() && !email.includes('@')) {
      errors.email = t.emailInvalidError;
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};
    if (role === 'farmer') {
      if (!farmSizeHa || isNaN(Number(farmSizeHa)) || Number(farmSizeHa) <= 0) {
        errors.farmSize = 'Enter a valid farm size in hectares';
      }
      if (cropsGrown.length === 0) {
        errors.crops = 'Select at least one crop';
      }
    } else if (role === 'cooperative_leader') {
      if (!coopName.trim()) errors.coopName = 'Cooperative name is required';
      if (!regNumber.trim()) errors.regNumber = 'Registration number is required';
    } else if (role === 'officer') {
      if (!staffId.trim()) errors.staffId = 'Staff ID is required';
      if (!officePhone.trim()) errors.officePhone = 'Office phone is required';
    } else if (role === 'researcher') {
      if (!institution.trim()) errors.institution = 'Institution is required';
      if (!researchArea.trim()) errors.researchArea = 'Research area is required';
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep4 = (): boolean => {
    const errors: Record<string, string> = {};
    if (!passHasLength || !passHasLetter || !passHasNumber) {
      errors.password = 'Password does not meet required strength criteria';
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = t.passwordsDoNotMatchError;
    }
    if (!agreedToTerms) {
      errors.terms = t.termsRequiredError;
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step navigation
  const handleNext = () => {
    setStepErrors({});
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    } else if (currentStep === 3) {
      if (validateStep3()) setCurrentStep(4);
    } else if (currentStep === 4) {
      if (validateStep4()) setCurrentStep(5);
    }
  };

  const handleBack = () => {
    setStepErrors({});
    if (currentStep === 1) {
      onBackToSignIn();
    } else {
      setCurrentStep((prev) => (prev - 1) as SignUpStep);
    }
  };

  // Verification completion
  const handleVerifySuccess = () => {
    const newAccount: UserAccount = {
      id: `acc-${Date.now()}`,
      role: role,
      fullName: fullName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      password: password,
      district: district,
      preferredLanguage: preferredLang,
      status: role === 'farmer' ? 'active' : 'pending',
      createdAt: '28/09/2026',
    };

    if (role === 'farmer') {
      newAccount.farmerDetails = {
        sector: sector,
        cell: cell,
        farmSizeHa: Number(farmSizeHa) || 0.8,
        cropsGrown: cropsGrown,
        cooperative: cooperative !== 'None / Individual' ? cooperative : undefined,
      };
      // Advance to step 6 (Ready screen)
      setCurrentStep(6);
    } else {
      // Non-farmer roles create access request
      let orgOrArea = '';
      if (role === 'cooperative_leader') {
        newAccount.coopDetails = {
          cooperativeName: coopName,
          registrationNumber: regNumber,
          sector: coopSector,
          membersCount: Number(membersCount) || 100,
        };
        orgOrArea = coopName;
      } else if (role === 'officer') {
        newAccount.officerDetails = {
          districtOfAssignment: districtOfAssignment,
          staffId: staffId,
          officePhone: officePhone,
        };
        orgOrArea = `${districtOfAssignment} District Extension`;
      } else if (role === 'researcher') {
        newAccount.researcherDetails = {
          institution: institution,
          researchArea: researchArea,
        };
        orgOrArea = institution;
      }

      const request: AccessRequest = {
        id: `req-${Date.now()}`,
        accountId: newAccount.id,
        role: role as 'cooperative_leader' | 'officer' | 'researcher',
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        organizationOrArea: orgOrArea,
        submittedAt: '28/09/2026 14:00',
        status: 'pending',
      };

      onRegisterAccessRequest(newAccount, request);
      // Advance to step 6 (Waiting for approval screen)
      setCurrentStep(6);
    }
  };

  // Masked destination for verification code
  const destinationMasked = useMemo(() => {
    if (role === 'farmer') {
      return maskPhone(phone);
    }
    return maskEmail(email || 'officer@domain.rw');
  }, [role, phone, email]);

  const stepLabels = [
    t.stepRole,
    t.stepDetails,
    t.stepFarmWork,
    t.stepPassword,
    t.stepVerify,
  ];

  return (
    <div className="max-w-[440px] w-full mx-auto my-auto space-y-6">
      {/* ========================================================================= */}
      {/* STEP INDICATOR (Role → Details → Farm/work → Password → Verify) */}
      {/* ========================================================================= */}
      {currentStep <= 5 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[#5B665E]">
            {stepLabels.map((lbl, idx) => {
              const stepNum = idx + 1;
              const isActive = currentStep === stepNum;
              const isPast = currentStep > stepNum;
              return (
                <div
                  key={stepNum}
                  className={`flex items-center gap-1.5 transition-colors ${
                    isActive
                      ? 'text-[#1F4A34] font-bold'
                      : isPast
                      ? 'text-[#3E8E55]'
                      : 'text-[#5B665E]/60'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? 'bg-[#1F4A34] text-white shadow-2xs'
                        : isPast
                        ? 'bg-[#E4ECDB] text-[#1F4A34]'
                        : 'bg-[#E4ECDB]/40 text-[#5B665E]/70'
                    }`}
                  >
                    {isPast ? '✓' : stepNum}
                  </span>
                  <span className="hidden sm:inline">{lbl}</span>
                </div>
              );
            })}
          </div>

          {/* Progress bar line */}
          <div className="h-1.5 w-full bg-[#E4ECDB]/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1F4A34] rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORM CARD */}
      {/* ========================================================================= */}
      <div className="bg-[#FBFCF8] rounded-[20px] p-6 sm:p-8 border border-[rgba(31,74,52,0.12)] shadow-[0_4px_24px_rgba(31,74,52,0.06)] space-y-6">
        {/* ===================================================================== */}
        {/* STEP 1: CHOOSE ROLE */}
        {/* ===================================================================== */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-[20px] font-bold text-[#17271D] tracking-tight">
                {t.roleTitle}
              </h2>
              <p className="text-[12px] text-[#5B665E] mt-0.5">
                {t.roleSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* 1. Farmer Card */}
              <div
                onClick={() => setRole('farmer')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  role === 'farmer'
                    ? 'bg-[#E4ECDB]/40 border-[#1F4A34] shadow-xs'
                    : 'bg-white border-[rgba(31,74,52,0.12)] hover:border-[rgba(31,74,52,0.25)]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    role === 'farmer'
                      ? 'bg-[#1F4A34] text-white'
                      : 'bg-[#E4ECDB] text-[#1F4A34]'
                  }`}
                >
                  <Sprout className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[13px] text-[#17271D]">
                      {t.farmerRole}
                    </span>
                    <span className="text-[10px] font-semibold text-[#1F4A34] bg-[#E4ECDB] px-2 py-0.5 rounded-full">
                      Instant access
                    </span>
                  </div>
                  <p className="text-[11.5px] text-[#5B665E] mt-0.5 leading-snug">
                    {t.farmerCardDesc}
                  </p>
                </div>
              </div>

              {/* 2. Cooperative Leader Card */}
              <div
                onClick={() => setRole('cooperative_leader')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  role === 'cooperative_leader'
                    ? 'bg-[#E4ECDB]/40 border-[#1F4A34] shadow-xs'
                    : 'bg-white border-[rgba(31,74,52,0.12)] hover:border-[rgba(31,74,52,0.25)]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    role === 'cooperative_leader'
                      ? 'bg-[#1F4A34] text-white'
                      : 'bg-[#E4ECDB] text-[#1F4A34]'
                  }`}
                >
                  <Users className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-[13px] text-[#17271D] block">
                    {t.coopRole}
                  </span>
                  <p className="text-[11.5px] text-[#5B665E] mt-0.5 leading-snug">
                    {t.coopCardDesc}
                  </p>
                </div>
              </div>

              {/* 3. Agricultural Officer Card */}
              <div
                onClick={() => setRole('officer')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  role === 'officer'
                    ? 'bg-[#E4ECDB]/40 border-[#1F4A34] shadow-xs'
                    : 'bg-white border-[rgba(31,74,52,0.12)] hover:border-[rgba(31,74,52,0.25)]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    role === 'officer'
                      ? 'bg-[#1F4A34] text-white'
                      : 'bg-[#E4ECDB] text-[#1F4A34]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-[13px] text-[#17271D] block">
                    {t.officerRole}
                  </span>
                  <p className="text-[11.5px] text-[#5B665E] mt-0.5 leading-snug">
                    {t.officerCardDesc}
                  </p>
                </div>
              </div>

              {/* 4. Researcher Card */}
              <div
                onClick={() => setRole('researcher')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  role === 'researcher'
                    ? 'bg-[#E4ECDB]/40 border-[#1F4A34] shadow-xs'
                    : 'bg-white border-[rgba(31,74,52,0.12)] hover:border-[rgba(31,74,52,0.25)]'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    role === 'researcher'
                      ? 'bg-[#1F4A34] text-white'
                      : 'bg-[#E4ECDB] text-[#1F4A34]'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-[13px] text-[#17271D] block">
                    {t.researcherRole}
                  </span>
                  <p className="text-[11.5px] text-[#5B665E] mt-0.5 leading-snug">
                    {t.researcherCardDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Muted note about Administrator accounts */}
            <p className="text-[11px] text-[#5B665E] italic pt-1 border-t border-[rgba(31,74,52,0.06)]">
              {t.adminCardNote}
            </p>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onBackToSignIn}
                className="text-[12px] text-[#5B665E] hover:text-[#17271D] font-medium flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.backToSignIn}</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="py-2.5 px-5 rounded-full bg-[#1F4A34] text-white text-[12.5px] font-semibold hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98"
              >
                <span>{t.nextButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 2: PROFILE DETAILS */}
        {/* ===================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-4 text-[12.5px]">
            <div>
              <h2 className="text-[20px] font-bold text-[#17271D] tracking-tight">
                {t.detailsTitle}
              </h2>
              <p className="text-[12px] text-[#5B665E] mt-0.5">
                Role: <span className="font-semibold text-[#1F4A34] capitalize">{role.replace('_', ' ')}</span>
              </p>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="font-semibold text-[#17271D] block">
                {t.fullNameLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.fullNamePlaceholder}
                className="w-full py-2.5 px-3.5 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[13px] focus:outline-hidden focus:border-[#1F4A34]"
              />
              {stepErrors.fullName && (
                <span className="text-[11px] text-red-600 block">{stepErrors.fullName}</span>
              )}
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="font-semibold text-[#17271D] block">
                {t.phoneLabel} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(formatRwandaPhone(e.target.value))}
                placeholder={t.phonePlaceholder}
                className="w-full py-2.5 px-3.5 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[13px] focus:outline-hidden focus:border-[#1F4A34]"
              />
              {stepErrors.phone ? (
                <span className="text-[11px] text-red-600 block">{stepErrors.phone}</span>
              ) : (
                <span className="text-[10.5px] text-[#5B665E] block">
                  Rwandan format: +250 7XX XXX XXX
                </span>
              )}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-[#17271D]">
                  {t.emailLabel} {role !== 'farmer' && <span className="text-red-500">*</span>}
                </label>
                {role === 'farmer' && (
                  <span className="text-[11px] text-[#5B665E]">{t.emailOptionalTag}</span>
                )}
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full py-2.5 px-3.5 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[13px] focus:outline-hidden focus:border-[#1F4A34]"
              />
              {stepErrors.email && (
                <span className="text-[11px] text-red-600 block">{stepErrors.email}</span>
              )}
            </div>

            {/* District of Residence / Operation (All 30 districts) */}
            <div className="space-y-1">
              <label className="font-semibold text-[#17271D] block">
                {t.districtLabel} <span className="text-red-500">*</span>
              </label>
              <select
                value={district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full py-2.5 px-3.5 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[13px] focus:outline-hidden focus:border-[#1F4A34]"
              >
                {RWANDA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d} District
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Language */}
            <div className="space-y-1.5 pt-1">
              <label className="font-semibold text-[#17271D] block">
                {t.languagePrefLabel}
              </label>
              <div className="inline-flex p-1 rounded-full bg-[#E4ECDB]/60 border border-[rgba(31,74,52,0.12)]">
                <button
                  type="button"
                  onClick={() => setPreferredLang('rw')}
                  className={`px-3 py-1 rounded-full text-[11.5px] font-medium transition-all cursor-pointer ${
                    preferredLang === 'rw'
                      ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
                      : 'text-[#5B665E] hover:text-[#17271D]'
                  }`}
                >
                  Kinyarwanda
                </button>
                <button
                  type="button"
                  onClick={() => setPreferredLang('en')}
                  className={`px-3 py-1 rounded-full text-[11.5px] font-medium transition-all cursor-pointer ${
                    preferredLang === 'en'
                      ? 'bg-[#1F4A34] text-white shadow-xs font-semibold'
                      : 'text-[#5B665E] hover:text-[#17271D]'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Back / Next buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[rgba(31,74,52,0.06)]">
              <button
                type="button"
                onClick={handleBack}
                className="text-[12px] text-[#5B665E] hover:text-[#17271D] font-medium flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.backButton}</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="py-2.5 px-5 rounded-full bg-[#1F4A34] text-white text-[12.5px] font-semibold hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98"
              >
                <span>{t.nextButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 3: FARM / WORK DETAILS (ROLE DEPENDENT) */}
        {/* ===================================================================== */}
        {currentStep === 3 && (
          <div className="space-y-4 text-[12.5px]">
            <div>
              <h2 className="text-[20px] font-bold text-[#17271D] tracking-tight">
                {role === 'farmer' ? t.farmWorkTitle : 'Professional details'}
              </h2>
              <p className="text-[12px] text-[#5B665E] mt-0.5">
                {role === 'farmer'
                  ? `Location & plot profile for ${district} District`
                  : `Credentials & affiliation for ${fullName}`}
              </p>
            </div>

            {/* 3A: FARMER FIELDS */}
            {role === 'farmer' && (
              <>
                {/* Dependent Sector & Cell dropdowns */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#17271D] block">
                      {t.sectorLabel} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={sector}
                      onChange={(e) => handleSectorChange(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[12.5px]"
                    >
                      {sectorOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#17271D] block">
                      {t.cellLabel} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={cell}
                      onChange={(e) => setCell(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[12.5px]"
                    >
                      {cellOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Farm size */}
                <div className="space-y-1">
                  <label className="font-semibold text-[#17271D] block">
                    {t.farmSizeLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={farmSizeHa}
                    onChange={(e) => setFarmSizeHa(e.target.value)}
                    placeholder={t.farmSizePlaceholder}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[12.5px]"
                  />
                  {stepErrors.farmSize && (
                    <span className="text-[11px] text-red-600 block">{stepErrors.farmSize}</span>
                  )}
                </div>

                {/* Crops Grown (Chips) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-[#17271D]">
                      {t.cropsGrownLabel} <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-[#5B665E]">{cropsGrown.length} selected</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CROP_OPTIONS.map((crop) => {
                      const isSelected = cropsGrown.includes(crop);
                      return (
                        <button
                          key={crop}
                          type="button"
                          onClick={() => handleToggleCrop(crop)}
                          className={`px-3 py-1 rounded-full text-[11.5px] font-medium transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#1F4A34] text-white shadow-2xs'
                              : 'bg-white text-[#5B665E] border border-[rgba(31,74,52,0.18)] hover:bg-[#F4F6EF]'
                          }`}
                        >
                          {isSelected ? `✓ ${crop}` : `+ ${crop}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cooperative (Optional dropdown) */}
                <div className="space-y-1 pt-1">
                  <label className="font-semibold text-[#17271D] block">
                    {t.cooperativeLabel}
                  </label>
                  <select
                    value={cooperative}
                    onChange={(e) => setCooperative(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[12.5px]"
                  >
                    {COOPERATIVE_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* 3B: COOPERATIVE LEADER FIELDS */}
            {role === 'cooperative_leader' && (
              <>
                <div className="space-y-1">
                  <label className="font-semibold text-[#17271D] block">
                    {t.coopNameLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={coopName}
                    onChange={(e) => setCoopName(e.target.value)}
                    placeholder={t.coopNamePlaceholder}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[12.5px]"
                  />
                  {stepErrors.coopName && (
                    <span className="text-[11px] text-red-600 block">{stepErrors.coopName}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#17271D] block">
                    {t.regNumberLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    placeholder={t.regNumberPlaceholder}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[12.5px]"
                  />
                  {stepErrors.regNumber && (
                    <span className="text-[11px] text-red-600 block">{stepErrors.regNumber}</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-[#17271D] block">
                      {t.sectorLabel} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={coopSector}
                      onChange={(e) => setCoopSector(e.target.value)}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[12.5px]"
                    >
                      {sectorOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-[#17271D] block">
                      {t.membersCountLabel} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={membersCount}
                      onChange={(e) => setMembersCount(e.target.value)}
                      placeholder={t.membersCountPlaceholder}
                      className="w-full py-2 px-3 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[12.5px]"
                    />
                  </div>
                </div>
              </>
            )}

            {/* 3C: AGRICULTURAL OFFICER FIELDS */}
            {role === 'officer' && (
              <>
                <div className="space-y-1">
                  <label className="font-semibold text-[#17271D] block">
                    {t.districtOfAssignmentLabel} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={districtOfAssignment}
                    onChange={(e) => setDistrictOfAssignment(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[12.5px]"
                  >
                    {RWANDA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d} District
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#17271D] block">
                    {t.staffIdLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    placeholder={t.staffIdPlaceholder}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[12.5px]"
                  />
                  {stepErrors.staffId && (
                    <span className="text-[11px] text-red-600 block">{stepErrors.staffId}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#17271D] block">
                    {t.officePhoneLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={officePhone}
                    onChange={(e) => setOfficePhone(e.target.value)}
                    placeholder="+250 252 510 120"
                    className="w-full py-2 px-3 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[12.5px]"
                  />
                  {stepErrors.officePhone && (
                    <span className="text-[11px] text-red-600 block">{stepErrors.officePhone}</span>
                  )}
                </div>
              </>
            )}

            {/* 3D: RESEARCHER FIELDS */}
            {role === 'researcher' && (
              <>
                <div className="space-y-1">
                  <label className="font-semibold text-[#17271D] block">
                    {t.institutionLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder={t.institutionPlaceholder}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[12.5px]"
                  />
                  {stepErrors.institution && (
                    <span className="text-[11px] text-red-600 block">{stepErrors.institution}</span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#17271D] block">
                    {t.researchAreaLabel} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={researchArea}
                    onChange={(e) => setResearchArea(e.target.value)}
                    placeholder={t.researchAreaPlaceholder}
                    className="w-full py-2 px-3 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[12.5px]"
                  />
                  {stepErrors.researchArea && (
                    <span className="text-[11px] text-red-600 block">{stepErrors.researchArea}</span>
                  )}
                </div>
              </>
            )}

            {/* Back / Next buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[rgba(31,74,52,0.06)]">
              <button
                type="button"
                onClick={handleBack}
                className="text-[12px] text-[#5B665E] hover:text-[#17271D] font-medium flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.backButton}</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="py-2.5 px-5 rounded-full bg-[#1F4A34] text-white text-[12.5px] font-semibold hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98"
              >
                <span>{t.nextButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 4: PASSWORD & AGREEMENT */}
        {/* ===================================================================== */}
        {currentStep === 4 && (
          <div className="space-y-4 text-[12.5px]">
            <div>
              <h2 className="text-[20px] font-bold text-[#17271D] tracking-tight">
                {t.passwordTitle}
              </h2>
              <p className="text-[12px] text-[#5B665E] mt-0.5">
                Set a strong credential for your account
              </p>
            </div>

            {/* Password with Eye icon */}
            <div className="space-y-1">
              <label className="font-semibold text-[#17271D] block">
                {t.createPasswordLabel} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="w-full py-2.5 pl-3.5 pr-10 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[13px] focus:outline-hidden focus:border-[#1F4A34]"
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

            {/* Strength bar: Weak / Fair / Strong */}
            {password && (
              <div className="space-y-1 pt-0.5">
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
                    {getPasswordStrengthLabel()}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 h-1.5 w-full">
                  <div
                    className={`rounded-full h-full transition-colors ${
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
                    className={`rounded-full h-full transition-colors ${
                      passScore >= 2
                        ? passScore === 2
                          ? 'bg-amber-500'
                          : 'bg-[#1F4A34]'
                        : 'bg-gray-200'
                    }`}
                  />
                  <div
                    className={`rounded-full h-full transition-colors ${
                      passScore === 3 ? 'bg-[#1F4A34]' : 'bg-gray-200'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Live Checklist: (8+ characters · a letter · a number) */}
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
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t.confirmPasswordPlaceholder}
                  className="w-full py-2.5 pl-3.5 pr-10 rounded-xl bg-white border border-[rgba(31,74,52,0.20)] text-[#17271D] text-[13px] focus:outline-hidden focus:border-[#1F4A34]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B665E] hover:text-[#17271D] cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {stepErrors.confirmPassword && (
                <span className="text-[11px] text-red-600 block">{stepErrors.confirmPassword}</span>
              )}
            </div>

            {/* Terms and Privacy policy checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded-sm text-[#1F4A34] focus:ring-[#1F4A34] cursor-pointer"
                />
                <span className="text-[11.5px] text-[#5B665E] leading-snug">
                  {t.termsAgreementLabel}
                </span>
              </label>
              {stepErrors.terms && (
                <span className="text-[11px] text-red-600 block mt-1">{stepErrors.terms}</span>
              )}
            </div>

            {/* Back / Next buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[rgba(31,74,52,0.06)]">
              <button
                type="button"
                onClick={handleBack}
                className="text-[12px] text-[#5B665E] hover:text-[#17271D] font-medium flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.backButton}</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="py-2.5 px-5 rounded-full bg-[#1F4A34] text-white text-[12.5px] font-semibold hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-98"
              >
                <span>{t.nextButton}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 5: VERIFY ACCOUNT WITH 6-BOX CODE */}
        {/* ===================================================================== */}
        {currentStep === 5 && (
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
              destinationType={role === 'farmer' ? 'sms' : 'email'}
              lang={lang}
              buttonLabel={t.stepVerify}
              onSuccess={handleVerifySuccess}
              onResend={() => {}}
            />

            <div className="text-center pt-1 border-t border-[rgba(31,74,52,0.06)]">
              <button
                type="button"
                onClick={handleBack}
                className="text-[12px] text-[#5B665E] hover:text-[#17271D] font-medium flex items-center justify-center gap-1 mx-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.backButton}</span>
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 6: POST-VERIFICATION READY OR WAITING FOR APPROVAL */}
        {/* ===================================================================== */}
        {currentStep === 6 && (
          <>
            {role === 'farmer' ? (
              /* FARMER: Account is Ready */
              <div className="space-y-6 text-center py-2">
                <div className="w-14 h-14 rounded-full bg-[#E4ECDB] flex items-center justify-center text-[#1F4A34] mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8 text-[#3E8E55]" strokeWidth={2.2} />
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-[22px] font-bold text-[#17271D] tracking-tight">
                    {t.accountReadyTitle}
                  </h2>
                  <p className="text-[12.5px] text-[#5B665E] max-w-sm mx-auto">
                    {t.accountReadySubtitle}
                  </p>
                </div>

                {/* Account details recap */}
                <div className="p-4 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.08)] text-left text-[12px] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#5B665E]">Farmer:</span>
                    <span className="font-semibold text-[#17271D]">{fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B665E]">Location:</span>
                    <span className="font-semibold text-[#17271D]">
                      {sector}, {cell} · {district}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B665E]">Farm size:</span>
                    <span className="font-semibold text-[#17271D]">{farmSizeHa} ha</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B665E]">Crops:</span>
                    <span className="font-semibold text-[#17271D]">{cropsGrown.join(', ')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const createdFarmer: UserAccount = {
                      id: `acc-farmer-${Date.now()}`,
                      role: 'farmer',
                      fullName: fullName.trim(),
                      phone: phone.trim(),
                      email: email.trim() || undefined,
                      password: password,
                      district: district,
                      preferredLanguage: preferredLang,
                      status: 'active',
                      createdAt: '28/09/2026',
                      farmerDetails: {
                        sector: sector,
                        cell: cell,
                        farmSizeHa: Number(farmSizeHa) || 0.8,
                        cropsGrown: cropsGrown,
                        cooperative: cooperative !== 'None / Individual' ? cooperative : undefined,
                      },
                    };
                    onSignUpFarmerSuccess(createdFarmer);
                  }}
                  className="w-full py-3 px-5 rounded-full bg-[#1F4A34] text-white text-[13px] font-semibold hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <span>{t.goToDashboardButton}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* NON-FARMER: Waiting for Approval */
              <div className="space-y-6 text-center py-2">
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

                {/* Application recap card */}
                <div className="p-4 rounded-xl bg-[#F4F6EF] border border-[rgba(31,74,52,0.08)] text-left text-[12px] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#5B665E]">Applicant:</span>
                    <span className="font-semibold text-[#17271D]">{fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B665E]">Role:</span>
                    <span className="font-semibold text-[#17271D] capitalize">
                      {role.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B665E]">Contact:</span>
                    <span className="font-semibold text-[#17271D]">{phone} · {email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B665E]">Submitted:</span>
                    <span className="font-semibold text-[#17271D]">28/09/2026 14:00</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onBackToSignIn}
                  className="w-full py-3 px-5 rounded-full bg-[#1F4A34] text-white text-[13px] font-semibold hover:bg-[#2C6343] transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.backToSignIn}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
