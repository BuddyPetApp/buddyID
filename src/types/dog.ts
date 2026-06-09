/**
 * Buddy — Tipos do Perfil do Cão (Questionário + Perfil Completo)
 */

export type DogGender = 'male' | 'female';

export type DogSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type DogTemperament =
  | 'calm'
  | 'energetic'
  | 'playful'
  | 'shy'
  | 'social'
  | 'protective'
  | 'independent'
  | 'anxious';

export type FoodType = 'dry' | 'wet' | 'mixed' | 'homemade';

export type ActivityLevel = 'low' | 'moderate' | 'high';

export type HousingType = 'apartment' | 'house_with_garden' | 'countryside';

export interface DogBasicInfo {
  name: string;
  photoUrl?: string;
  gender?: DogGender;
  breed?: string;
  isSterilized?: boolean | null;
  birthdate?: string; // ISO YYYY-MM-DD
  weightKg?: number;
  size?: DogSize;
  temperament?: DogTemperament[];
}

export interface DogFood {
  type?: FoodType;
  mealsPerDay?: number;
  brand?: string;
  hasRestrictions?: boolean;
  restrictionsNotes?: string;
}

export interface DogActivity {
  level?: ActivityLevel;
  walksPerDay?: number;
  avgDurationMin?: number;
}

export interface DogLifestyle {
  housing?: HousingType;
  livesWithDogs?: boolean;
  livesWithChildren?: boolean;
  livesWithCats?: boolean;
  livesWithTeenagers?: boolean;
  livesWithElderly?: boolean;
  sleepingPlace?: string;
  exerciseDuration?: string;
}

export interface DogHabits {
  food?: DogFood;
  activity?: DogActivity;
  lifestyle?: DogLifestyle;
  origin?: string;
  traumaHistory?: string;
  preferredServices?: string[];
  customService?: string;
}

export interface DogSocialization {
  people?: number; // 1..5
  dogs?: number;
  children?: number;
}

export interface DogBehavior {
  socialization?: DogSocialization;
  likes?: string[];
  fears?: string[];
  tutorNotes?: string;
  leashBehavior?: string[];
  separationAnxiety?: string;
  goals?: string[];
}

export interface DogVaccine {
  name: string;
  date: string; // ISO YYYY-MM-DD
}

export interface DogDewormingEntry {
  lastDate: string; // ISO
  product?: string;
}

export interface DogDeworming {
  internal?: DogDewormingEntry;
  external?: DogDewormingEntry;
}

export interface DogAllergies {
  tags: string[];
  other?: string;
}

export interface DogVet {
  name?: string;
  clinic?: string;
  phone?: string;
}

export interface DogHealth {
  chipNumber?: string;
  vaccines?: DogVaccine[];
  deworming?: DogDeworming;
  allergies?: DogAllergies;
  medication?: string;
  vet?: DogVet;
  concerns?: 'Sim' | 'Não';
  concernsText?: string;
}

export const ALLERGY_OPTIONS_PT: readonly string[] = [
  'Alimentos',
  'Pólen',
  'Picadas',
  'Produtos de limpeza',
];

export interface DogProfile {
  id: string;
  basicInfo: DogBasicInfo;
  habits: DogHabits;
  behavior: DogBehavior;
  health?: DogHealth;
  updatedAt: string; // ISO
}

// ─── Completude (para a progress bar do hub) ────────────────────────────────

export type SectionKey = 'basic' | 'habits' | 'behavior';

export interface SectionCompleteness {
  basic: boolean;
  habits: boolean;
  behavior: boolean;
}

export function isBasicComplete(b: DogBasicInfo | null | undefined): boolean {
  if (!b) return false;
  return (
    !!b.name &&
    !!b.gender &&
    !!b.breed &&
    !!b.birthdate &&
    typeof b.weightKg === 'number' &&
    !!b.size
  );
}

export function isHabitsComplete(h: DogHabits | null | undefined): boolean {
  if (!h) return false;
  return (
    !!h.food?.type &&
    !!h.activity?.level &&
    !!h.lifestyle?.housing &&
    !!h.lifestyle?.sleepingPlace &&
    !!h.lifestyle?.exerciseDuration &&
    !!h.origin
  );
}

export function isBehaviorComplete(b: DogBehavior | null | undefined): boolean {
  if (!b) return false;
  const s = b.socialization;
  const socializationDone =
    typeof s?.people === 'number' &&
    typeof s?.dogs === 'number' &&
    typeof s?.children === 'number';
  const likesDone = (b.likes?.length ?? 0) >= 1;
  const fearsDone = Array.isArray(b.fears);
  const leashDone = Array.isArray(b.leashBehavior) && b.leashBehavior.length > 0;
  const separationDone = !!b.separationAnxiety;
  return socializationDone && likesDone && fearsDone && leashDone && separationDone;
}

export function computeCompleteness(profile: DogProfile): SectionCompleteness {
  return {
    basic: isBasicComplete(profile?.basicInfo),
    habits: isHabitsComplete(profile?.habits),
    behavior: isBehaviorComplete(profile?.behavior),
  };
}

export function computeProgress(profile: DogProfile): number {
  const c = computeCompleteness(profile);
  const done = [c.basic, c.habits, c.behavior].filter(Boolean).length;
  return Math.round((done / 3) * 100);
}

// ─── Listas auxiliares (UI) ─────────────────────────────────────────────────

export const DOG_BREEDS_PT: readonly string[] = [
  'Labrador Retriever',
  'Golden Retriever',
  'Serra da Estrela',
  'Rafeiro do Alentejo',
  'Podengo Português',
  'Cão de Água Português',
  'Bulldog Francês',
  'Border Collie',
  'Husky Siberiano',
  'Pastor Alemão',
  'Yorkshire Terrier',
  'Chihuahua',
  'Beagle',
  'Shih Tzu',
  'Caniche',
  'Cocker Spaniel',
  'Dálmata',
  'Boxer',
  'Pug',
  'Rafeiro (SRD)',
];

export const SIZE_LABELS_PT: Record<DogSize, string> = {
  xs: 'XS (até 5 kg)',
  sm: 'S (5–10 kg)',
  md: 'M (10–25 kg)',
  lg: 'L (25–40 kg)',
  xl: 'XL (mais de 40 kg)',
};

export const SIZE_LABELS_EN: Record<DogSize, string> = {
  xs: 'XS (up to 5 kg)',
  sm: 'S (5–10 kg)',
  md: 'M (10–25 kg)',
  lg: 'L (25–40 kg)',
  xl: 'XL (over 40 kg)',
};

export const GENDER_LABELS_PT: Record<DogGender, string> = {
  male: 'Macho',
  female: 'Fêmea',
};

export const TEMPERAMENT_LABELS_PT: Record<DogTemperament, string> = {
  calm: 'Calmo',
  energetic: 'Energético',
  playful: 'Brincalhão',
  shy: 'Tímido',
  social: 'Sociável',
  protective: 'Protector',
  independent: 'Independente',
  anxious: 'Ansioso',
};

export const FOOD_TYPE_LABELS_PT: Record<FoodType, string> = {
  dry: 'Ração seca',
  wet: 'Ração húmida',
  mixed: 'Mista',
  homemade: 'Caseira',
};

export const ACTIVITY_LEVEL_LABELS_PT: Record<ActivityLevel, string> = {
  low: 'Baixo',
  moderate: 'Moderado',
  high: 'Alto',
};

export const HOUSING_LABELS_PT: Record<HousingType, string> = {
  apartment: 'Apartamento',
  house_with_garden: 'Casa com jardim',
  countryside: 'Quinta',
};

export const LIKES_OPTIONS_PT: readonly string[] = [
  'Bola',
  'Água',
  'Passeios longos',
  'Festinhas',
  'Peluches',
  'Brincar ao toque',
  'Esconde-esconde',
];

export const FEARS_OPTIONS_PT: readonly string[] = [
  'Trovoada',
  'Foguetes',
  'Carros',
  'Outros cães',
  'Estranhos',
  'Aspirador',
];

export function ageFromBirthdate(iso: string | undefined): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let years = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) years--;
  return years;
}
