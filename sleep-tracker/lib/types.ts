export interface SleepEntry {
  id: string;
  start: Date;
  end: Date;
  rate: number;
  notes: string;
  userId: string;
}

export interface SleepStats {
  avgDuration: number;
  avgQuality: number;
  bestNight?: SleepEntry;
  worstNight?: SleepEntry;
}