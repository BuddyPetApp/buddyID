export type DogSize = 'XS' | 'S' | 'M' | 'L' | 'XL';
export type Gender = 'Macho' | 'Fêmea';
export type NeuteredStatus = 'Sim' | 'Não' | 'Não sei';
export type EnergyLevel = 'Calmo' | 'Moderado' | 'Muito ativo';
export type StrangerBehavior = 'Amigável' | 'Reservado' | 'Reativo';
export type HomePeopleBehavior = 'Nunca' | 'Raramente' | 'Por vezes';
export type Obedience = 'Aprende rápido' | 'Seletivo' | 'Difícil';
export type Attachment = 'Independente' | 'Equilibrado' | 'Colado';
export type TouchSensitivity = 'Tranquilo' | 'Tolerante' | 'Sensível';
export type NewSituations = 'Curioso' | 'Cauteloso' | 'Assustado';
export type Housing = 'Apartamento' | 'Casa sem jardim' | 'Casa com jardim' | 'Quinta / rural';
export type SleepingPlace = 'Na cama' | 'No sofá' | 'Cama própria' | 'No exterior';
export type ExerciseDuration = '< 30 min' | '30–60 min' | '> 60 min';
export type DogOrigin =
  | 'Adotei de um canil ou associação'
  | 'Comprei de um criador'
  | 'Resgatei da rua'
  | 'Recebi de alguém'
  | 'Outra forma';
export type SeparationAnxiety =
  | 'Fica calmo e tranquilo'
  | 'Ladra ou range um pouco'
  | 'Fica muito ansioso'
  | 'Destrói coisas quando fico fora'
  | 'Nunca o deixo sozinho'
  | 'Não sei';

export interface BuddyIDFormData {
  name: string;
  photoUri?: string;
  breed: string;
  size?: DogSize;
  age: string;
  gender?: Gender;
  neutered?: NeuteredStatus;
  energy?: EnergyLevel;
  withStrangers?: StrangerBehavior;
  withHomePeople?: HomePeopleBehavior;
  obedience?: Obedience;
  attachment?: Attachment;
  touchSensitivity?: TouchSensitivity;
  newSituations?: NewSituations;
  leashBehavior: string[];
  housing?: Housing;
  housemates: string[];
  sleepingPlace?: SleepingPlace;
  exerciseDuration?: ExerciseDuration;
  origin?: DogOrigin;
  traumaHistory?: string;
  separationAnxiety: SeparationAnxiety[];
  email: string;
  phone: string;
  city: string;
  postalCode?: string;
  fears: string[];
  customFear?: string;
  services: string[];
  customService?: string;
  hasConcerns?: 'Sim' | 'Não';
  concernsText?: string;
  goals: string[];
  consentMarketing: boolean;
  consentDataUse: boolean;
}

export const INITIAL_FORM_DATA: BuddyIDFormData = {
  name: '',
  breed: '',
  age: '',
  leashBehavior: [],
  housemates: [],
  email: '',
  phone: '',
  separationAnxiety: [],
  city: '',
  fears: [],
  services: [],
  goals: [],
  consentMarketing: false,
  consentDataUse: false,
};
