export type Gender = 'male' | 'female' | 'unknown';

export type BirdStatus = 'active' | 'deceased' | 'sold' | 'exchanged';

export type Bird = {
  id: string;
  ringNumber: string;
  name: string; // Made name required
  species: string;
  subspecies?: string;
  gender: Gender;
  colorMutation?: string;
  birthDate: Date;
  origin: 'purchased' | 'bred' | 'rescue';
  status: BirdStatus;
  aviaryId?: string;
  notes?: string;
  imageUri?: string;
  fatherId?: string;
  motherId?: string;
  createdAt: Date;
};

export type HealthRecord = {
  id: string;
  birdId: string;
  date: Date;
  type: 'vaccination' | 'medication' | 'checkup' | 'other';
  description: string;
  notes?: string;
};

export type Couple = {
  id: string;
  maleId: string;
  femaleId: string;
  season: string; // e.g., "2025"
  active: boolean;
  notes?: string;
  createdAt: Date;
};

export type EggStatus = 'laid' | 'fertile' | 'infertile' | 'hatched' | 'dead';

export type Egg = {
  id: string;
  nestId: string;
  layDate: Date;
  status: EggStatus;
  hatchDate?: Date;
  birdId?: string; // If hatched, reference to the bird
  notes?: string;
};

export type Nest = {
  id: string;
  coupleId: string;
  startDate: Date;
  aviaryId?: string;
  active: boolean;
  notes?: string;
  eggCount?: number;
  expectedHatchDate?: Date;
  actualHatchDate?: Date;
  hatchedCount?: number;
  createdAt: Date;
};

export type Aviary = {
  id: string;
  name: string;
  location?: string;
  capacity: number;
  notes?: string;
  description?: string;
  createdAt: Date;
};

export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  isActive: boolean;
};