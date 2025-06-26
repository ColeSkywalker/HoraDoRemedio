export type Frequency = 8 | 12 | 24;

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: Frequency;
  startTime: string; // HH:mm format
  observations?: string;
}

export type DoseStatus = "taken" | "skipped" | "pending";

export interface Dose {
  id: string;
  medicationId: string;
  scheduledTime: Date;
  status: DoseStatus;
}
