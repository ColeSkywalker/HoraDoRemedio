"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { Medication, Dose, DoseStatus } from "./types";
import { add, set, isToday, isSameMinute } from "date-fns";

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
  notificationPermission: NotificationPermission;
  addMedication: (medication: Omit<Medication, "id">) => void;
  deleteMedication: (medicationId: string) => void;
  updateDoseStatus: (doseId: string, status: DoseStatus) => void;
  getAdherence: () => { taken: number; skipped: number; pending: number; adherenceRate: number };
  requestNotificationPermission: () => Promise<NotificationPermission>;
  scheduleNotifications: () => void;
  refreshDoseStatuses: () => void;
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
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  const refreshDoseStatuses = useCallback(() => {
    // This function can be expanded later if needed, for now it does nothing.
    // Kept for consistency with the original structure that had it.
  }, []);

  // Check notification permission on load
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      return permission;
    }
    return 'default';
  };

  const showNotification = useCallback((dose: Dose, med: Medication) => {
    if (notificationPermission === 'granted') {
      const title = `Hora do Remédio: ${med.name}`;
      const options: NotificationOptions = {
        body: `É hora de tomar sua dose de ${med.dosage}.`,
        icon: '/icons/icon-192x192.png', 
        badge: '/icons/icon-96x96.png',
        vibrate: [200, 100, 200],
      };
      new Notification(title, options);
    }
  }, [notificationPermission]);

  const scheduleNotifications = useCallback(() => {
    const now = new Date();
    doses.forEach(dose => {
      const med = medications.find(m => m.id === dose.medicationId);
      if (med && dose.status === 'pending' && isSameMinute(dose.scheduledTime, now)) {
        showNotification(dose, med);
      }
    });
  }, [doses, medications, showNotification]);


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

        setDoses(mergedDoses);

      } else {
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
    const pastDosesToday = todayDoses.filter(d => d.scheduledTime <= now && (d.status === 'taken' || d.status === 'skipped'));
    
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
    notificationPermission,
    addMedication,
    deleteMedication,
    updateDoseStatus,
    getAdherence,
    requestNotificationPermission,
    scheduleNotifications,
    refreshDoseStatuses,
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
