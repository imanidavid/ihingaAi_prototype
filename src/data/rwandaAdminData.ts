/**
 * Rwanda administrative divisions, crop options, cooperatives, and initial accounts.
 * Frontend prototype: accounts and codes are simulated and stored in shared store.
 */

import { AccessRequest, UserAccount } from '../types';

export const RWANDA_DISTRICTS = [
  'Musanze',
  'Burera',
  'Gakenke',
  'Gicumbi',
  'Rulindo',
  'Nyabihu',
  'Rubavu',
  'Rutsiro',
  'Ngororero',
  'Karongi',
  'Nyamasheke',
  'Rusizi',
  'Huye',
  'Nyanza',
  'Gisagara',
  'Ruhango',
  'Muhanga',
  'Kamonyi',
  'Nyamagabe',
  'Nyaruguru',
  'Rwamagana',
  'Kayonza',
  'Gatsibo',
  'Nyagatare',
  'Kirehe',
  'Ngoma',
  'Bugesera',
  'Gasabo',
  'Kicukiro',
  'Nyarugenge',
] as const;

export const MUSANZE_SECTORS = [
  'Kinigi',
  'Muhoza',
  'Busogo',
  'Remera',
  'Cyuve',
  'Gacaca',
  'Gashaki',
  'Gataraga',
  'Kimonyi',
  'Musanze',
  'Muko',
  'Nkotsi',
  'Nyange',
  'Rwaza',
  'Shingiro',
] as const;

export const SECTOR_CELLS_MAP: Record<string, string[]> = {
  Kinigi: ['Kaguhu', 'Nyange', 'Bisoke', 'Susa', 'Kampanga'],
  Muhoza: ['Cyivugiza', 'Ruhengeri', 'Kigombe', 'Mpenge'],
  Busogo: ['Sahara', 'Gisesero', 'Nyagisozi'],
  Remera: ['Murambi', 'Gasiza', 'Ruvumu'],
  Cyuve: ['Bukinanyana', 'Cyanya', 'Kabeza', 'Rwebeya'],
  Gacaca: ['Karwasa', 'Gasiza', 'Rwambogo'],
  Gashaki: ['Kigabiro', 'Ndurumo', 'Mbizi'],
  Gataraga: ['Rubindi', 'Rurembo', 'Mudasomwa'],
  Kimonyi: ['Kibirizi', 'Buruba', 'Kivumu'],
  Musanze: ['Garuka', 'Rwambogo', 'Nyamagumba'],
  Muko: ['Cyogo', 'Songa', 'Mburabuturo'],
  Nkotsi: ['Bikara', 'Gashinga', 'Rugendabari'],
  Nyange: ['Ninda', 'Kanyirangabo', 'Nyamurimirwa'],
  Rwaza: ['Bumara', 'Kabere', 'Nturo'],
  Shingiro: ['Kibuguzo', 'Mudakama', 'Gakingo'],
};

export function getSectorsForDistrict(district: string): string[] {
  if (district === 'Musanze') {
    return [...MUSANZE_SECTORS];
  }
  if (district === 'Nyabihu') {
    return ['Bigogwe', 'Jenda', 'Mukamira', 'Rurembo', 'Rambura', 'Kabatwa'];
  }
  if (district === 'Rubavu') {
    return ['Gisenyi', 'Rugerero', 'Rubavu', 'Kanama', 'Nyamyumba', 'Mudende'];
  }
  if (district === 'Burera') {
    return ['Cyanika', 'Rugarama', 'Kagogo', 'Gahunga', 'Nemba', 'Ruhondo'];
  }
  // Generic sectors fallback
  return ['Centre', 'North', 'South', 'East', 'West'];
}

export function getCellsForSector(sector: string): string[] {
  if (SECTOR_CELLS_MAP[sector]) {
    return SECTOR_CELLS_MAP[sector];
  }
  return ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4'];
}

export const CROP_OPTIONS = [
  'Irish Potato',
  'Climbing Beans',
  'Maize',
  'Wheat',
  'Vegetables',
  'Sweet Potato',
  'Banana',
  'Coffee',
  'Tea',
  'Pyrethrum',
];

export const COOPERATIVE_OPTIONS = [
  'None / Individual',
  'Musanze Potato Growers Cooperative',
  'Kinigi Bean Farmers Union',
  'Busogo Maize Cooperative',
  'Muhoza Vegetable Growers',
  'Remera Wheat & Potato Cooperative',
  'Nyange Pyrethrum Growers',
  'Other cooperative',
];

// Phone formatter: standardizes input to Rwandan format +250 7XX XXX XXX
export function formatRwandaPhone(input: string): string {
  // Strip non-digits except initial +
  let cleaned = input.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+250')) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith('250')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  // Keep up to 9 digits
  cleaned = cleaned.replace(/\D/g, '').slice(0, 9);
  if (!cleaned) return '+250 ';

  let formatted = '+250';
  if (cleaned.length > 0) formatted += ' ' + cleaned.slice(0, 3);
  if (cleaned.length > 3) formatted += ' ' + cleaned.slice(3, 6);
  if (cleaned.length > 6) formatted += ' ' + cleaned.slice(6, 9);
  return formatted;
}

export function validateRwandaPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  // Must end with 9 digits starting with 7 (e.g. 250788123456 or 788123456)
  if (digits.length === 12 && digits.startsWith('2507')) return true;
  if (digits.length === 9 && digits.startsWith('7')) return true;
  return false;
}

// Mask phone for SMS verification: +250 78• ••• •45
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const localDigits = digits.length === 12 ? digits.slice(3) : digits;
  if (localDigits.length >= 9) {
    const prefix = localDigits.slice(0, 2); // e.g. 78
    const suffix = localDigits.slice(-2);  // e.g. 45
    return `+250 ${prefix}• ••• •${suffix}`;
  }
  return '+250 78• ••• •12';
}

// Mask email for Email verification: c••••••@domain.rw
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'u••••••@domain.rw';
  const [name, domain] = email.split('@');
  if (name.length <= 2) return `${name}••••@${domain}`;
  const first = name[0];
  return `${first}••••••@${domain}`;
}

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'acc-farmer-jb',
    role: 'farmer',
    fullName: 'Jean-Baptiste Ndayisaba',
    phone: '+250 788 000 012',
    email: 'j.ndayisaba@musanzecoop.rw',
    password: 'demo1234',
    district: 'Musanze',
    preferredLanguage: 'rw',
    status: 'active',
    createdAt: '01/09/2026',
    lastSignIn: '28/09/2026 13:40',
    twoStepEnabled: false,
    scope: { district: 'Musanze', sectors: ['Kinigi'], cooperative: 'Musanze Potato Growers Cooperative' },
    farmerDetails: {
      sector: 'Kinigi',
      cell: 'Bisoke',
      farmSizeHa: 1.8,
      cropsGrown: ['Irish Potato', 'Climbing Beans', 'Maize'],
      cooperative: 'Musanze Potato Growers Cooperative',
    },
  },
  {
    id: 'acc-officer-claudine',
    role: 'officer',
    fullName: 'Claudine Mukamana',
    phone: '+250 788 000 014',
    email: 'claudine.m@ihinga.demo',
    password: 'demo1234',
    district: 'Musanze',
    preferredLanguage: 'en',
    status: 'active',
    createdAt: '01/09/2026',
    lastSignIn: '28/09/2026 08:10',
    twoStepEnabled: true,
    scope: { district: 'Musanze', sectors: [] },
    officerDetails: {
      districtOfAssignment: 'Musanze',
      staffId: 'MUS-AO-4401',
      officePhone: '+250 252 510 120',
    },
  },
  {
    id: 'acc-coop-aline',
    role: 'cooperative',
    fullName: 'Aline Uwimana',
    phone: '+250 788 000 034',
    email: 'aline.u@musanzepotato.coop',
    password: 'demo1234',
    district: 'Musanze',
    preferredLanguage: 'rw',
    status: 'active',
    createdAt: '01/09/2026',
    lastSignIn: '28/09/2026 09:25',
    twoStepEnabled: false,
    scope: {
      district: 'Musanze',
      sectors: ['Kinigi', 'Busogo', 'Muhoza'],
      cooperative: 'Musanze Potato Growers Cooperative',
    },
    coopDetails: {
      cooperativeName: 'Musanze Potato Growers Cooperative',
      registrationNumber: 'RCA/2021/0492',
      sector: 'Kinigi',
      membersCount: 186,
    },
  },
  {
    id: 'acc-admin-grace',
    role: 'admin',
    fullName: 'Grace Ingabire',
    phone: '+250 788 000 050',
    email: 'grace.i@ihinga.demo',
    password: 'demo1234',
    district: 'Musanze',
    preferredLanguage: 'en',
    status: 'active',
    createdAt: '01/09/2026',
    lastSignIn: '28/09/2026 07:55',
    twoStepEnabled: true,
    scope: { district: 'Musanze', sectors: [] },
  },
  {
    id: 'acc-researcher-diane',
    role: 'researcher',
    fullName: 'Diane Uwase',
    phone: '+250 788 000 066',
    email: 'diane.u@ihinga.demo',
    password: 'demo1234',
    district: 'Musanze',
    preferredLanguage: 'en',
    status: 'active',
    createdAt: '03/09/2026',
    lastSignIn: '25/09/2026 11:05',
    twoStepEnabled: false,
    scope: { district: 'Musanze', sectors: [] },
    researcherDetails: { institution: 'Climate research group (demo)', researchArea: 'Rainfall forecasting' },
  },
  {
    id: 'acc-officer-innocent',
    role: 'officer',
    fullName: 'Innocent Mugabo',
    phone: '+250 788 000 018',
    email: 'innocent.m@ihinga.demo',
    password: 'demo1234',
    district: 'Musanze',
    preferredLanguage: 'rw',
    status: 'active',
    createdAt: '02/09/2026',
    lastSignIn: '27/09/2026 16:20',
    twoStepEnabled: true,
    scope: { district: 'Musanze', sectors: ['Muhoza', 'Cyuve'] },
    officerDetails: { districtOfAssignment: 'Musanze', staffId: 'MUS-AO-4405', officePhone: '+250 252 510 124' },
  },
  {
    id: 'acc-farmer-faustin',
    role: 'farmer',
    fullName: 'Faustin Nzeyimana',
    phone: '+250 784 155 775',
    district: 'Musanze',
    preferredLanguage: 'rw',
    status: 'active',
    createdAt: '04/09/2026',
    lastSignIn: '25/09/2026 13:45',
    twoStepEnabled: false,
    scope: { district: 'Musanze', sectors: ['Kinigi'], cooperative: 'Musanze Potato Growers Cooperative' },
    farmerDetails: { sector: 'Kinigi', cell: 'Bisoke', farmSizeHa: 0.9, cropsGrown: ['Irish Potato', 'Climbing Beans'], cooperative: 'Musanze Potato Growers Cooperative' },
  },
  {
    id: 'acc-farmer-marie',
    role: 'farmer',
    fullName: 'Marie Uwase',
    phone: '+250 785 410 233',
    district: 'Musanze',
    preferredLanguage: 'rw',
    status: 'active',
    createdAt: '05/09/2026',
    lastSignIn: '28/09/2026 11:40',
    twoStepEnabled: false,
    scope: { district: 'Musanze', sectors: ['Busogo'], cooperative: 'Musanze Potato Growers Cooperative' },
    farmerDetails: { sector: 'Busogo', cell: 'Sahara', farmSizeHa: 0.7, cropsGrown: ['Irish Potato', 'Maize'], cooperative: 'Musanze Potato Growers Cooperative' },
  },
  {
    id: 'acc-farmer-theophile',
    role: 'farmer',
    fullName: 'Theophile Nsabimana',
    phone: '+250 786 902 117',
    district: 'Musanze',
    preferredLanguage: 'rw',
    status: 'suspended',
    createdAt: '06/09/2026',
    lastSignIn: '24/09/2026 08:45',
    twoStepEnabled: false,
    scope: { district: 'Musanze', sectors: ['Muhoza'] },
    farmerDetails: { sector: 'Muhoza', cell: 'Kigombe', farmSizeHa: 0.5, cropsGrown: ['Irish Potato'] },
  },
  // Waiting for an administrator (see INITIAL_ACCESS_REQUESTS)
  {
    id: 'acc-pending-esther',
    role: 'officer',
    fullName: 'Esther Nyirabagenzi',
    phone: '+250 788 000 061',
    email: 'esther.n@ihinga.demo',
    password: 'demo1234',
    district: 'Musanze',
    preferredLanguage: 'en',
    status: 'pending',
    createdAt: '27/09/2026',
    twoStepEnabled: true,
    scope: { district: 'Musanze', sectors: [] },
    officerDetails: { districtOfAssignment: 'Musanze', staffId: 'MUS-AO-4410', officePhone: '+250 252 510 131' },
  },
  {
    id: 'acc-pending-celestin',
    role: 'cooperative',
    fullName: 'Celestin Ndayambaje',
    phone: '+250 788 000 072',
    email: 'celestin.n@kinigibeans.coop',
    password: 'demo1234',
    district: 'Musanze',
    preferredLanguage: 'rw',
    status: 'pending',
    createdAt: '28/09/2026',
    twoStepEnabled: false,
    scope: { district: 'Musanze', sectors: ['Kinigi'], cooperative: 'Kinigi Bean Farmers Union' },
    coopDetails: {
      cooperativeName: 'Kinigi Bean Farmers Union',
      registrationNumber: 'RCA/2019/0317',
      sector: 'Kinigi',
      membersCount: 124,
    },
  },
];

/** Two access requests waiting when the demo starts. */
export const INITIAL_ACCESS_REQUESTS: AccessRequest[] = [
  {
    id: 'req-esther',
    accountId: 'acc-pending-esther',
    role: 'officer',
    fullName: 'Esther Nyirabagenzi',
    phone: '+250 788 000 061',
    email: 'esther.n@ihinga.demo',
    organizationOrArea: 'Musanze District Extension',
    submittedAt: '27/09/2026 10:15',
    status: 'pending',
  },
  {
    id: 'req-celestin',
    accountId: 'acc-pending-celestin',
    role: 'cooperative',
    fullName: 'Celestin Ndayambaje',
    phone: '+250 788 000 072',
    email: 'celestin.n@kinigibeans.coop',
    organizationOrArea: 'Kinigi Bean Farmers Union',
    submittedAt: '28/09/2026 09:40',
    status: 'pending',
  },
];

/** The demo account each role signs in as from the floating role switcher. */
export const DEMO_ACCOUNT_ID_BY_ROLE: Record<UserAccount['role'], string> = {
  farmer: 'acc-farmer-jb',
  officer: 'acc-officer-claudine',
  cooperative: 'acc-coop-aline',
  admin: 'acc-admin-grace',
  researcher: 'acc-researcher-diane',
};

// =========================================================================
// BULK IMPORT (cooperative member lists as CSV)
// =========================================================================
export const IMPORT_CSV_COLUMNS = ['full_name', 'phone', 'sector', 'cell', 'crops'];

/** Sample file for the demo: 4 valid rows and 4 rows with problems. */
export const SAMPLE_MEMBER_IMPORT_CSV = [
  'full_name,phone,sector,cell,crops',
  'Josiane Mukandori,+250 783 551 204,Kinigi,Kaguhu,Irish Potato;Climbing Beans',
  'Pascal Niyibizi,+250 784 662 315,Busogo,Sahara,Irish Potato;Maize',
  'Vestine Uwamahirwe,+250 785 773 426,Muhoza,Mpenge,Irish Potato',
  'Emile Tuyishimire,+250 782 106 759,Busogo,Gisesero,Irish Potato',
  'Jean Bosco Hakizimana,0788 12 34,Kinigi,Bisoke,Irish Potato',
  'Odile Mukamurigo,+250 788 000 012,Kinigi,Susa,Irish Potato',
  'Felix Nkurunziza,+250 786 884 537,Rubavu,Gisenyi,Maize',
  'Clarisse Uwimbabazi,+250 787 995 648,Kinigi,Kabeza,Irish Potato',
].join('\n');

export interface ImportRow {
  line: number;
  fullName: string;
  phone: string;
  sector: string;
  cell: string;
  crops: string[];
  errors: string[];
}

/** Parse and check a member CSV against Musanze sectors/cells and existing accounts. */
export function parseMemberCsv(text: string, existing: UserAccount[]): { rows: ImportRow[]; headerError: string | null } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { rows: [], headerError: 'The file is empty.' };
  const header = lines[0].toLowerCase().split(',').map((h) => h.trim());
  const missing = IMPORT_CSV_COLUMNS.filter((c) => !header.includes(c));
  if (missing.length > 0) return { rows: [], headerError: `Missing columns: ${missing.join(', ')}.` };

  const col = (cells: string[], name: string) => (cells[header.indexOf(name)] || '').trim();
  const digits = (p: string) => p.replace(/\D/g, '').slice(-9);
  const existingPhones = new Set(existing.map((a) => digits(a.phone)));
  const seen = new Set<string>();

  const rows = lines.slice(1).map((line, idx) => {
    const cells = line.split(',');
    const row: ImportRow = {
      line: idx + 2,
      fullName: col(cells, 'full_name'),
      phone: col(cells, 'phone'),
      sector: col(cells, 'sector'),
      cell: col(cells, 'cell'),
      crops: col(cells, 'crops').split(';').map((c) => c.trim()).filter(Boolean),
      errors: [],
    };
    if (!row.fullName) row.errors.push('Name is missing');
    if (!validateRwandaPhone(row.phone)) row.errors.push('Phone is not a Rwandan mobile number');
    else if (existingPhones.has(digits(row.phone))) row.errors.push('Phone already has an account');
    else if (seen.has(digits(row.phone))) row.errors.push('Phone appears twice in this file');
    if (!(MUSANZE_SECTORS as readonly string[]).includes(row.sector)) row.errors.push(`${row.sector || 'Sector'} is not a Musanze sector`);
    else if (!getCellsForSector(row.sector).includes(row.cell)) row.errors.push(`${row.cell || 'Cell'} is not a cell of ${row.sector}`);
    const badCrops = row.crops.filter((c) => !CROP_OPTIONS.includes(c));
    if (badCrops.length > 0) row.errors.push(`Unknown crop: ${badCrops.join(', ')}`);
    if (validateRwandaPhone(row.phone)) seen.add(digits(row.phone));
    return row;
  });
  return { rows, headerError: null };
}
