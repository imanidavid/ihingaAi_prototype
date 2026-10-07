/**
 * Rwanda administrative divisions, crop options, cooperatives, and initial accounts.
 * Frontend prototype: accounts and codes are simulated and stored in shared store.
 */

import { UserAccount } from '../types';

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
    officerDetails: {
      districtOfAssignment: 'Musanze',
      staffId: 'MUS-AO-4401',
      officePhone: '+250 252 510 120',
    },
  },
  {
    id: 'acc-coop-aline',
    role: 'cooperative_leader',
    fullName: 'Aline Uwimana',
    phone: '+250 788 000 034',
    email: 'aline.u@musanzepotato.coop',
    password: 'demo1234',
    district: 'Musanze',
    preferredLanguage: 'rw',
    status: 'active',
    createdAt: '01/09/2026',
    coopDetails: {
      cooperativeName: 'Musanze Potato Growers Cooperative',
      registrationNumber: 'RCA/2021/0492',
      sector: 'Kinigi',
      membersCount: 186,
    },
  },
];
