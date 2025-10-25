"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Medication, Dose, DoseStatus } from "./types";
import { add, set, isToday } from "date-fns";

// --- Mock Data (Fallback) ---
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
  deleteMedication: (medicationId: string) => void;
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

const generateDosesForDay = (medications: Medication[], date: Date): Dose[] => {
    const startOfDay = set(date, { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 });
    const endOfDay = set(date, { hours: 23, minutes: 59, seconds: 59, milliseconds: 999 });

    return medications.flatMap(med => generateDosesForMedication(med, startOfDay, endOfDay));
}


// --- Provider Component ---
export const PillPalStoreProvider = ({ children }: { children: ReactNode }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [doses, setDoses] = useState<Dose[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const storedMeds = localStorage.getItem("horaDoRemedio-medications");
      const storedDoses = localStorage.getItem("horaDoRemedio-doses");
      
      const initialMeds = storedMeds ? JSON.parse(storedMeds) : MOCK_MEDICATIONS;
      setMedications(initialMeds);

      const todayDoses = generateDosesForDay(initialMeds, new Date());

      if (storedDoses) {
        const parsedDoses: Dose[] = JSON.parse(storedDoses).map((d: any) => ({...d, scheduledTime: new Date(d.scheduledTime)}));
        
        // Filter out old doses and merge with newly generated today's doses
        const relevantStoredDoses = parsedDoses.filter(d => isToday(d.scheduledTime));
        
        const mergedDoses = todayDoses.map(newDose => {
            const existingDose = relevantStoredDoses.find(rd => rd.id === newDose.id);
            return existingDose || newDose;
        });

        // Mark past pending doses as skipped automatically
        mergedDoses.forEach(dose => {
          if(dose.status === 'pending' && dose.scheduledTime < new Date()){
            dose.status = 'skipped';
          }
        });

        setDoses(mergedDoses);

      } else {
         // Mark past pending doses as skipped automatically on first load
        todayDoses.forEach(dose => {
          if(dose.status === 'pending' && dose.scheduledTime < new Date()){
            dose.status = Math.random() > 0.3 ? 'taken' : 'skipped';
          }
        });
        setDoses(todayDoses);
      }

    } catch (error) {
      console.error("Failed to load state from localStorage", error);
      setMedications(MOCK_MEDICATIONS);
      setDoses(generateDosesForDay(MOCK_MEDICATIONS, new Date()));
    } finally {
        setIsLoaded(true);
    }
  }, []);

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("horaDoRemedio-medications", JSON.stringify(medications));
        localStorage.setItem("horaDoRemedio-doses", JSON.stringify(doses));
      } catch (error) {
        console.error("Failed to save state to localStorage", error);
      }
    }
  }, [medications, doses, isLoaded]);

  // Regenerate doses if medications change
  useEffect(() => {
    if(isLoaded){
        const todayDoses = generateDosesForDay(medications, new Date());
        
        const mergedDoses = todayDoses.map(newDose => {
            const existingDose = doses.find(d => d.id === newDose.id);
            return existingDose || newDose;
        });

        setDoses(mergedDoses);
    }
  // We only want to run this when medications array changes, not doses.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medications, isLoaded]);

  const addMedication = (medication: Omit<Medication, "id">) => {
    const newMed: Medication = { ...medication, id: new Date().toISOString() };
    setMedications(prevMeds => [...prevMeds, newMed]);
  };
  
  const deleteMedication = (medicationId: string) => {
    setMedications(prevMeds => prevMeds.filter(med => med.id !== medicationId));
    setDoses(prevDoses => prevDoses.filter(dose => dose.medicationId !== medicationId));
  };

  const updateDoseStatus = (doseId: string, status: DoseStatus) => {
    setDoses(
      doses.map((dose) => (dose.id === doseId ? { ...dose, status } : dose))
    );
  };

  const getAdherence = () => {
    const now = new Date();
    // Consider all doses from today for adherence calculation, not just past ones in the whole list
    const todayDoses = doses.filter(d => isToday(d.scheduledTime));
    const pastDosesToday = todayDoses.filter(d => d.scheduledTime <= now);
    
    const taken = pastDosesToday.filter(d => d.status === 'taken').length;
    const skipped = pastDosesToday.filter(d => d.status === 'skipped').length;
    
    const totalPast = taken + skipped;
    const adherenceRate = totalPast > 0 ? Math.round((taken / totalPast) * 100) : 100;

    const pending = todayDoses.filter(d => d.status === 'pending').length;

    return { taken, skipped, pending, adherenceRate };
  }

  const value = {
    medications,
    doses,
    addMedication,
    deleteMedication,
    updateDoseStatus,
    getAdherence,
  };

  return <PillPalContext.Provider value={value}>{isLoaded ? children : null}</PillPalContext.Provider>;
};

// --- Custom Hook ---
export const usePillPalStore = () => {
  const context = useContext(PillPalContext);
  if (context === undefined) {
    throw new Error("usePillPalStore must be used within a PillPalStoreProvider");
  }
  return context;
};
