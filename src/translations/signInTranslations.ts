export type SignInLanguage = 'en' | 'rw';

export interface SignInTranslationStrings {
  // Hero & Brand
  heroHeading: string;
  heroSubheading: string;

  // Sign In Form
  phoneOrEmailLabel: string;
  phoneOrEmailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  signInButton: string;
  signingIn: string;
  forgotPassword: string;
  createAccount: string;
  errorIncorrect: string;
  errorTooManyAttempts: string;
  demoAccountsTitle: string;
  demoAccountsSubtitle: string;
  farmerRole: string;
  farmerName: string;
  officerRole: string;
  officerName: string;
  coopRole: string;
  coopLeaderName: string;
  researcherRole: string;
  adminRole: string;
  designedInNextIteration: string;

  // Two-Step & Verification Codes
  twoStepHeading: string;
  twoStepSubtitle: string;
  twoStepDemoHint: string;
  twoStepVerifyButton: string;
  twoStepInvalidError: string;
  codeTooManyAttemptsError: string;
  codeSentToSms: string;
  codeSentToEmail: string;
  resendCountdown: string;
  resendButton: string;
  autoFillButton: string;
  backToSignIn: string;
  staySignedIn: string;
  timeoutModalTitle: string;
  timeoutCountdownText: string;
  signOut: string;

  // Navigation & Steps
  stepRole: string;
  stepDetails: string;
  stepFarmWork: string;
  stepPassword: string;
  stepVerify: string;
  nextButton: string;
  backButton: string;

  // Step 1: Role Selection
  roleTitle: string;
  roleSubtitle: string;
  farmerCardDesc: string;
  coopCardDesc: string;
  officerCardDesc: string;
  researcherCardDesc: string;
  adminCardNote: string;

  // Step 2: Details
  detailsTitle: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  emailLabel: string;
  emailOptionalTag: string;
  emailPlaceholder: string;
  districtLabel: string;
  languagePrefLabel: string;
  phoneInvalidError: string;
  emailInvalidError: string;
  nameRequiredError: string;

  // Step 3: Farm / Work Details
  farmWorkTitle: string;
  sectorLabel: string;
  cellLabel: string;
  farmSizeLabel: string;
  farmSizePlaceholder: string;
  cropsGrownLabel: string;
  cropsGrownSubtitle: string;
  cooperativeLabel: string;
  coopNameLabel: string;
  coopNamePlaceholder: string;
  regNumberLabel: string;
  regNumberPlaceholder: string;
  membersCountLabel: string;
  membersCountPlaceholder: string;
  districtOfAssignmentLabel: string;
  staffIdLabel: string;
  staffIdPlaceholder: string;
  officePhoneLabel: string;
  institutionLabel: string;
  institutionPlaceholder: string;
  researchAreaLabel: string;
  researchAreaPlaceholder: string;

  // Step 4: Password & Terms
  passwordTitle: string;
  createPasswordLabel: string;
  passwordStrengthLabel: string;
  strengthWeak: string;
  strengthFair: string;
  strengthStrong: string;
  checkLength: string;
  checkLetter: string;
  checkNumber: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  passwordsDoNotMatchError: string;
  termsAgreementLabel: string;
  termsRequiredError: string;

  // Step 5: Verify
  verifyAccountTitle: string;
  verifyAccountSubtitle: string;

  // Post-Signup Status
  accountReadyTitle: string;
  accountReadySubtitle: string;
  goToDashboardButton: string;
  waitingApprovalTitle: string;
  waitingApprovalBody: string;

  // Forgot Password Flow
  forgotPasswordTitle: string;
  forgotPasswordSubtitle: string;
  sendCodeButton: string;
  resetPasswordTitle: string;
  resetPasswordSubtitle: string;
  saveNewPasswordButton: string;
  passwordChangedTitle: string;
  passwordChangedBody: string;
}

export const SIGN_IN_TRANSLATIONS: Record<SignInLanguage, SignInTranslationStrings> = {
  en: {
    heroHeading: 'Climate risk intelligence for Rwandan farmers',
    heroSubheading: 'Real-time hazard monitoring, weather forecasts, and agronomic advisories across Musanze District.',
    phoneOrEmailLabel: 'Phone number or email',
    phoneOrEmailPlaceholder: '+250 788 000 012 or name@domain.rw',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    signInButton: 'Sign in',
    signingIn: 'Signing in...',
    forgotPassword: 'Forgot password?',
    createAccount: 'New to IHINGA AI? Create an account',
    errorIncorrect: 'Phone number or password is incorrect.',
    errorTooManyAttempts: 'Too many attempts. Try again in 15 minutes.',
    demoAccountsTitle: 'Demo accounts for reviewers',
    demoAccountsSubtitle: 'Click any reviewer account to prefill credentials',
    farmerRole: 'Farmer',
    farmerName: 'Jean-Baptiste Ndayisaba',
    officerRole: 'Agricultural officer',
    officerName: 'Claudine Mukamana',
    coopRole: 'Cooperative leader',
    coopLeaderName: 'Aline Uwimana',
    researcherRole: 'Researcher',
    adminRole: 'Administrator',
    designedInNextIteration: 'Designed in next iteration',

    // Two-Step & Verification Codes
    twoStepHeading: 'Two-step verification',
    twoStepSubtitle: 'Enter the 6-digit code from your authenticator app',
    twoStepDemoHint: 'Demo code: 246810',
    twoStepVerifyButton: 'Verify and sign in',
    twoStepInvalidError: 'That code is incorrect. Try again.',
    codeTooManyAttemptsError: 'Too many attempts. Request a new code.',
    codeSentToSms: 'Code sent to',
    codeSentToEmail: 'Code sent to',
    resendCountdown: 'Resend code in',
    resendButton: 'Resend code',
    autoFillButton: 'Auto-fill',
    backToSignIn: 'Back to sign in',
    staySignedIn: 'Stay signed in',
    timeoutModalTitle: "You'll be signed out in 60 seconds",
    timeoutCountdownText: 'Due to inactivity, your secure session will expire soon.',
    signOut: 'Sign out',

    // Steps
    stepRole: 'Role',
    stepDetails: 'Details',
    stepFarmWork: 'Farm / work',
    stepPassword: 'Password',
    stepVerify: 'Verify',
    nextButton: 'Continue',
    backButton: 'Back',

    // Step 1: Role
    roleTitle: 'Choose your role',
    roleSubtitle: 'Select your primary role in the agricultural ecosystem',
    farmerCardDesc: 'Access field-level hazard warnings, soil conditions, and localized crop advisories.',
    coopCardDesc: 'Monitor member fields, cooperative aggregation risk, and seasonal advisories.',
    officerCardDesc: 'Review farmer field observations, broadcast warnings, and district climate risk.',
    researcherCardDesc: 'Explore forecasts, field reports and model accuracy.',
    adminCardNote: 'Administrator accounts are created by the system administrator.',

    // Step 2: Details
    detailsTitle: 'Your profile details',
    fullNameLabel: 'Full name',
    fullNamePlaceholder: 'e.g. Emmanuel Habimana',
    phoneLabel: 'Phone number',
    phonePlaceholder: '+250 788 000 000',
    emailLabel: 'Email address',
    emailOptionalTag: '(optional for farmers)',
    emailPlaceholder: 'name@domain.rw',
    districtLabel: 'District',
    languagePrefLabel: 'Preferred language',
    phoneInvalidError: 'Enter a valid Rwandan phone number (+250 7XX XXX XXX)',
    emailInvalidError: 'Enter a valid email address',
    nameRequiredError: 'Full name is required',

    // Step 3: Farm / Work Details
    farmWorkTitle: 'Farm and location details',
    sectorLabel: 'Sector',
    cellLabel: 'Cell',
    farmSizeLabel: 'Farm size (ha)',
    farmSizePlaceholder: 'e.g. 0.8',
    cropsGrownLabel: 'Crops grown',
    cropsGrownSubtitle: 'Select crops planted this season',
    cooperativeLabel: 'Cooperative membership (optional)',
    coopNameLabel: 'Cooperative name',
    coopNamePlaceholder: 'e.g. COOPAMA Kinigi',
    regNumberLabel: 'Registration number',
    regNumberPlaceholder: 'e.g. RCA/2021/0492',
    membersCountLabel: 'Number of members',
    membersCountPlaceholder: 'e.g. 140',
    districtOfAssignmentLabel: 'District of assignment',
    staffIdLabel: 'Staff ID',
    staffIdPlaceholder: 'e.g. MUS-AO-8821',
    officePhoneLabel: 'Office phone',
    institutionLabel: 'Institution / Organization',
    institutionPlaceholder: 'e.g. University of Rwanda',
    researchAreaLabel: 'Research area',
    researchAreaPlaceholder: 'e.g. Agro-climatology & crop epidemiology',

    // Step 4: Password
    passwordTitle: 'Set your password',
    createPasswordLabel: 'Password',
    passwordStrengthLabel: 'Password strength',
    strengthWeak: 'Weak',
    strengthFair: 'Fair',
    strengthStrong: 'Strong',
    checkLength: '8+ characters',
    checkLetter: 'a letter',
    checkNumber: 'a number',
    confirmPasswordLabel: 'Confirm password',
    confirmPasswordPlaceholder: 'Re-enter your password',
    passwordsDoNotMatchError: 'Passwords do not match',
    termsAgreementLabel: 'I agree to the terms and privacy policy',
    termsRequiredError: 'You must agree to the terms and privacy policy',

    // Step 5: Verify
    verifyAccountTitle: 'Verify your account',
    verifyAccountSubtitle: 'Enter the 6-digit verification code sent to your device',

    // Post-Signup Status
    accountReadyTitle: 'Your account is ready',
    accountReadySubtitle: 'Welcome to IHINGA AI. Your farmer account is active.',
    goToDashboardButton: 'Go to dashboard',
    waitingApprovalTitle: 'Waiting for approval',
    waitingApprovalBody: "An administrator will review your account. We'll send you an SMS or email when it's approved.",

    // Forgot Password Flow
    forgotPasswordTitle: 'Reset your password',
    forgotPasswordSubtitle: 'Enter your phone number or email to receive a verification code',
    sendCodeButton: 'Send verification code',
    resetPasswordTitle: 'Create new password',
    resetPasswordSubtitle: 'Enter a new secure password for your account',
    saveNewPasswordButton: 'Save new password',
    passwordChangedTitle: 'Password changed',
    passwordChangedBody: 'Your password has been updated successfully. You can now sign in with your new password.',
  },
  rw: {
    // to be reviewed by a native speaker
    heroHeading: "Ikoranabuhanga ry'ubumenyi bw'ikirere ku bahinzi bo mu Rwanda",
    // to be reviewed by a native speaker
    heroSubheading: "Amakuru y'imvura n'iteganyagihe by'ako kanya, imiyoboro y'ubutabazi n'inama z'ubuhinzi muri Karere ka Musanze.",
    // to be reviewed by a native speaker
    phoneOrEmailLabel: 'Nimero ya telefone cyangwa imeli',
    // to be reviewed by a native speaker
    phoneOrEmailPlaceholder: '+250 788 000 012 cyangwa izina@domain.rw',
    // to be reviewed by a native speaker
    passwordLabel: 'Ijambobanga',
    // to be reviewed by a native speaker
    passwordPlaceholder: 'Injiza ijambobanga ryawe',
    // to be reviewed by a native speaker
    signInButton: 'Injira',
    // to be reviewed by a native speaker
    signingIn: 'Kwinjira...',
    // to be reviewed by a native speaker
    forgotPassword: 'Wibagiwe ijambobanga?',
    // to be reviewed by a native speaker
    createAccount: 'Muri bashya muri IHINGA AI? Fungura konti',
    // to be reviewed by a native speaker
    errorIncorrect: 'Nimero ya telefone cyangwa ijambobanga ntibyo.',
    // to be reviewed by a native speaker
    errorTooManyAttempts: "Wagerageje kenshi cyane. Ongera ugerageze nyuma y'iminota 15.",
    // to be reviewed by a native speaker
    demoAccountsTitle: "Konti z'igerageza ku basuzuma",
    // to be reviewed by a native speaker
    demoAccountsSubtitle: 'Kanda kuri konti wifuza kugira ngo yuzuze imyirondoro',
    // to be reviewed by a native speaker
    farmerRole: 'Umuhinzi',
    // to be reviewed by a native speaker
    farmerName: 'Jean-Baptiste Ndayisaba',
    // to be reviewed by a native speaker
    officerRole: 'Umukozi w’ubuhinzi',
    // to be reviewed by a native speaker
    officerName: 'Claudine Mukamana',
    // to be reviewed by a native speaker
    coopRole: 'Umuyobozi wa koperative',
    // to be reviewed by a native speaker
    coopLeaderName: 'Aline Uwimana',
    // to be reviewed by a native speaker
    researcherRole: 'Umushakashatsi',
    // to be reviewed by a native speaker
    adminRole: 'Umuyobozi wa sisitemu',
    // to be reviewed by a native speaker
    designedInNextIteration: 'Bizakorwa mu kindi cyiciro',

    // to be reviewed by a native speaker
    twoStepHeading: "Isuzuma ry'intambwe ebyiri",
    // to be reviewed by a native speaker
    twoStepSubtitle: "Injiza imibare 6 iva muri porogaramu yawe y'umutekano",
    // to be reviewed by a native speaker
    twoStepDemoHint: "Kode y'igerageza: 246810",
    // to be reviewed by a native speaker
    twoStepVerifyButton: 'Emeza winjire',
    // to be reviewed by a native speaker
    twoStepInvalidError: 'Iyo kode si yo. Ongera ugerageze.',
    // to be reviewed by a native speaker
    codeTooManyAttemptsError: 'Wagerageje kenshi cyane. Saba indi kode nshya.',
    // to be reviewed by a native speaker
    codeSentToSms: 'Kode yoherejwe kuri',
    // to be reviewed by a native speaker
    codeSentToEmail: 'Kode yoherejwe kuri',
    // to be reviewed by a native speaker
    resendCountdown: 'Ongera usabe kode mu masegonda',
    // to be reviewed by a native speaker
    resendButton: 'Ongera wohereze kode',
    // to be reviewed by a native speaker
    autoFillButton: 'Yuzuze ako kanya',
    // to be reviewed by a native speaker
    backToSignIn: 'Gusubira ahabanza',
    // to be reviewed by a native speaker
    staySignedIn: 'Guma muri sisitemu',
    // to be reviewed by a native speaker
    timeoutModalTitle: 'Gusohoka mu masegonda 60',
    // to be reviewed by a native speaker
    timeoutCountdownText: 'Kubera kutagira igikorwa, umutekano wa konti yawe ugiye kurangira.',
    // to be reviewed by a native speaker
    signOut: 'Sohoka',

    // to be reviewed by a native speaker
    stepRole: 'Icyiciro',
    // to be reviewed by a native speaker
    stepDetails: 'Imyirondoro',
    // to be reviewed by a native speaker
    stepFarmWork: 'Umurima / Akazi',
    // to be reviewed by a native speaker
    stepPassword: 'Ijambobanga',
    // to be reviewed by a native speaker
    stepVerify: 'Kwemeza',
    // to be reviewed by a native speaker
    nextButton: 'Komeza',
    // to be reviewed by a native speaker
    backButton: 'Subira inyuma',

    // to be reviewed by a native speaker
    roleTitle: 'Hitamo icyiciro cyawe',
    // to be reviewed by a native speaker
    roleSubtitle: 'Hitamo umurimo ukora mu buhinzi',
    // to be reviewed by a native speaker
    farmerCardDesc: 'Amakuru y’imvura, ibyago by’ikirere n’inama z’ubuhinzi ku murima wawe.',
    // to be reviewed by a native speaker
    coopCardDesc: 'Gukurikirana imirima y’abanyamuryango n’amakuru y’isarura rya koperative.',
    // to be reviewed by a native speaker
    officerCardDesc: 'Kugenzura raporo z’abahinzi, kohereza imburagihe n’ibyago by’akarere.',
    // to be reviewed by a native speaker
    researcherCardDesc: 'Kureba iteganyagihe, raporo zo mu murima n’ukuri kw’icyitegererezo.',
    // to be reviewed by a native speaker
    adminCardNote: 'Konti z’abayobozi ba sisitemu zishyirwaho n’umuyobozi mukuru.',

    // to be reviewed by a native speaker
    detailsTitle: 'Imyirondoro yawe',
    // to be reviewed by a native speaker
    fullNameLabel: 'Amazina yose',
    // to be reviewed by a native speaker
    fullNamePlaceholder: 'urugero: Emmanuel Habimana',
    // to be reviewed by a native speaker
    phoneLabel: 'Nimero ya telefone',
    // to be reviewed by a native speaker
    phonePlaceholder: '+250 788 000 000',
    // to be reviewed by a native speaker
    emailLabel: 'Imeli',
    // to be reviewed by a native speaker
    emailOptionalTag: '(ku bahinzi si ngombwa)',
    // to be reviewed by a native speaker
    emailPlaceholder: 'izina@domain.rw',
    // to be reviewed by a native speaker
    districtLabel: 'Akarere',
    // to be reviewed by a native speaker
    languagePrefLabel: 'Ururimi wifuza',
    // to be reviewed by a native speaker
    phoneInvalidError: 'Shyiramo nimero ya telefone nyayo y’u Rwanda (+250 7XX XXX XXX)',
    // to be reviewed by a native speaker
    emailInvalidError: 'Shyiramo imeli nyayo',
    // to be reviewed by a native speaker
    nameRequiredError: 'Amazina arakenewe',

    // to be reviewed by a native speaker
    farmWorkTitle: 'Amakuru y’umurima n’aho uri',
    // to be reviewed by a native speaker
    sectorLabel: 'Umurenge',
    // to be reviewed by a native speaker
    cellLabel: 'Akagari',
    // to be reviewed by a native speaker
    farmSizeLabel: 'Ubuso bw’umurima (ha)',
    // to be reviewed by a native speaker
    farmSizePlaceholder: 'urugero: 0.8',
    // to be reviewed by a native speaker
    cropsGrownLabel: 'Ibihingwa uhinga',
    // to be reviewed by a native speaker
    cropsGrownSubtitle: 'Hitamo ibihingwa wahinze muri iki gihembwe',
    // to be reviewed by a native speaker
    cooperativeLabel: 'Koperative ubamo (si ngombwa)',
    // to be reviewed by a native speaker
    coopNameLabel: 'Izina rya koperative',
    // to be reviewed by a native speaker
    coopNamePlaceholder: 'urugero: COOPAMA Kinigi',
    // to be reviewed by a native speaker
    regNumberLabel: 'Nimero y’ubuzimagatozi',
    // to be reviewed by a native speaker
    regNumberPlaceholder: 'urugero: RCA/2021/0492',
    // to be reviewed by a native speaker
    membersCountLabel: 'Umubare w’abanyamuryango',
    // to be reviewed by a native speaker
    membersCountPlaceholder: 'urugero: 140',
    // to be reviewed by a native speaker
    districtOfAssignmentLabel: 'Akarere ukoreramo',
    // to be reviewed by a native speaker
    staffIdLabel: 'Nimero y’akazi (Staff ID)',
    // to be reviewed by a native speaker
    staffIdPlaceholder: 'urugero: MUS-AO-8821',
    // to be reviewed by a native speaker
    officePhoneLabel: 'Telefone y’ibiro',
    // to be reviewed by a native speaker
    institutionLabel: 'Ikigo cyangwa Kaminuza',
    // to be reviewed by a native speaker
    institutionPlaceholder: 'urugero: Kaminuza y’u Rwanda',
    // to be reviewed by a native speaker
    researchAreaLabel: 'Icyo ukoraho ubushakashatsi',
    // to be reviewed by a native speaker
    researchAreaPlaceholder: 'urugero: Iteganyagihe ry’ubuhinzi n’indwara z’ibirayi',

    // to be reviewed by a native speaker
    passwordTitle: 'Gushyiraho ijambobanga',
    // to be reviewed by a native speaker
    createPasswordLabel: 'Ijambobanga',
    // to be reviewed by a native speaker
    passwordStrengthLabel: 'Imbaraga z’ijambobanga',
    // to be reviewed by a native speaker
    strengthWeak: 'Ryoroshye',
    // to be reviewed by a native speaker
    strengthFair: 'Riringaniye',
    // to be reviewed by a native speaker
    strengthStrong: 'Rikomeye',
    // to be reviewed by a native speaker
    checkLength: 'Inyuguti 8 cyangwa zirenga',
    // to be reviewed by a native speaker
    checkLetter: 'Inyuguti imwe nibura',
    // to be reviewed by a native speaker
    checkNumber: 'Umubare umwe nibura',
    // to be reviewed by a native speaker
    confirmPasswordLabel: 'Emeza ijambobanga',
    // to be reviewed by a native speaker
    confirmPasswordPlaceholder: 'Ongera wandike ijambobanga ryawe',
    // to be reviewed by a native speaker
    passwordsDoNotMatchError: 'Amagambobanga ntabwo ahuye',
    // to be reviewed by a native speaker
    termsAgreementLabel: 'Nemeye amategeko n’amabwiriza y’umutekano',
    // to be reviewed by a native speaker
    termsRequiredError: 'Ugomba kwemera amategeko n’amabwiriza',

    // to be reviewed by a native speaker
    verifyAccountTitle: 'Kwemeza konti yawe',
    // to be reviewed by a native speaker
    verifyAccountSubtitle: 'Injiza kode y’imibare 6 yoherejwe kuri telefone cyangwa imeli',

    // to be reviewed by a native speaker
    accountReadyTitle: 'Konti yawe yiteguye',
    // to be reviewed by a native speaker
    accountReadySubtitle: 'Murakaza neza muri IHINGA AI. Konti yanyu y’ubuhinzi irakora.',
    // to be reviewed by a native speaker
    goToDashboardButton: 'Komeza ku ifishi',
    // to be reviewed by a native speaker
    waitingApprovalTitle: 'Tegereza kwemererwa',
    // to be reviewed by a native speaker
    waitingApprovalBody: 'Umuyobozi wa sisitemu agiye gusuzuma konti yawe. Tuzakoherereza ubutumwa bugufi cyangwa imeli nibyemezwa.',

    // to be reviewed by a native speaker
    forgotPasswordTitle: 'Guhindura ijambobanga',
    // to be reviewed by a native speaker
    forgotPasswordSubtitle: 'Shyiramo telefone cyangwa imeli yawe kugira ngo wohererezwe kode',
    // to be reviewed by a native speaker
    sendCodeButton: 'Ohereza kode yo kwemeza',
    // to be reviewed by a native speaker
    resetPasswordTitle: 'Shyiraho ijambobanga rishya',
    // to be reviewed by a native speaker
    resetPasswordSubtitle: 'Hitamo ijambobanga rishya rikomeye rya konti yawe',
    // to be reviewed by a native speaker
    saveNewPasswordButton: 'Bika ijambobanga rishya',
    // to be reviewed by a native speaker
    passwordChangedTitle: 'Ijambobanga ryahinduwe',
    // to be reviewed by a native speaker
    passwordChangedBody: 'Ijambobanga ryawe ryahinduwe neza. Ubu ushobora kwinjira ukoresheje ijambobanga rishya.',
  },
};
