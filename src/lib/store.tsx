"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Medication, Dose, DoseStatus, Frequency } from "./types";
import { add, set } from "date-fns";

// --- Mock Data ---
const MOCK_MEDICATIONS: Medication[] = [
  { id: "1", name: "Lisinopril", dosage: "10mg", frequency: 24, startTime: "08:00", observations: "Tomar com o estômago cheio." },
  { id: "2", name: "Metformina", dosage: "500mg", frequency: 12, startTime: "09:00" },
  { id: "3", name: "Amoxicilina", dosage: "250mg", frequency: 8, startTime: "07:00", observations: "Evitar laticínios por 1 hora após tomar." },
];

// --- State and Actions Types ---
interface PillPalState {
  medications: Medication[];
  doses: Dose[];
  addMedication: (medication: Omit<Medication, "id">) => void;
  updateDoseStatus: (doseId: string, status: DoseStatus) => void;
  getAdherence: () => { taken: number; skipped: number; pending: number; adherenceRate: number };
}

// --- Context ---
const PillPalContext = createContext<PillPalState | undefined>(undefined);

// --- Helper Functions ---
const generateDosesForMedication = (med: Medication, from: Date, to: Date): Dose[] => {
  const newDoses: Dose[] = [];
  const [startHour, startMinute] = med.startTime.split(":").map(Number);

  let currentTime = set(from, { hours: startHour, minutes: startMinute, seconds: 0, milliseconds: 0 });

  while (currentTime <= to) {
    if (currentTime >= from) {
      newDoses.push({
        id: `${med.id}-${currentTime.getTime()}`,
        medicationId: med.id,
        scheduledTime: new Date(currentTime),
        status: "pending",
      });
    }
    currentTime = add(currentTime, { hours: med.frequency });
  }
  return newDoses;
};

const generateInitialDoses = (medications: Medication[]): Dose[] => {
  const today = new Date();
  const startOfToday = set(today, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
  const endOfToday = set(today, { hours: 23, minutes: 59, seconds: 59, milliseconds: 999 });

  let allDoses = medications.flatMap(med => generateDosesForMedication(med, startOfToday, endOfToday));
  
  // For demo, let's mark some past doses automatically
  allDoses.forEach(dose => {
    if(dose.scheduledTime < new Date()) {
      // Randomly mark as taken or skipped
      dose.status = Math.random() > 0.3 ? 'taken' : 'skipped';
    }
  });

  return allDoses;
};

// --- Provider Component ---
export const PillPalStoreProvider = ({ children }: { children: ReactNode }) => {
  const [medications, setMedications] = useState<Medication[]>(MOCK_MEDICATIONS);
  const [doses, setDoses] = useState<Dose[]>([]);

  useEffect(() => {
    setDoses(generateInitialDoses(medications));
  }, [medications]);


  const addMedication = (medication: Omit<Medication, "id">) => {
    const newMed: Medication = { ...medication, id: new Date().toISOString() };
    const updatedMeds = [...medications, newMed];
    setMedications(updatedMeds);
  };

  const updateDoseStatus = (doseId: string, status: DoseStatus) => {
    setDoses(
      doses.map((dose) => (dose.id === doseId ? { ...dose, status } : dose))
    );
  };

  const getAdherence = () => {
    const now = new Date();
    const pastDoses = doses.filter(d => d.scheduledTime <= now);
    const taken = pastDoses.filter(d => d.status === 'taken').length;
    const skipped = pastDoses.filter(d => d.status === 'skipped').length;
    const pending = doses.filter(d => d.status === 'pending' && d.scheduledTime > now).length;
    const totalPast = taken + skipped;
    const adherenceRate = totalPast > 0 ? Math.round((taken / totalPast) * 100) : 100;

    return { taken, skipped, pending, adherenceRate };
  }

  const value = {
    medications,
    doses,
    addMedication,
    updateDoseStatus,
    getAdherence,
  };

  return <PillPalContext.Provider value={value}>{children}</PillPalContext.Provider>;
};

// --- Custom Hook ---
export const usePillPalStore = () => {
  const context = useContext(PillPalContext);
  if (context === undefined) {
    throw new Error("usePillPalStore must be used within a PillPalStoreProvider");
  }
  return context;
};
