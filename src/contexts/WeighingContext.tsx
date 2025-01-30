import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WeighingEntry {
  id: string;
  licensePlate: string;
  fullWeight?: number;
  emptyWeight?: number;
  cargoType?: 'Holz' | 'Kies' | 'Müll' | 'Papier' | 'Sand' | 'Aushub' | 'gesiebte Erde fein' | 'gesiebte Erde Grob';
  timestamp: Date;
  lastUpdated: Date;
}

interface WeighingContextType {
  entries: WeighingEntry[];
  addEntry: (entry: Omit<WeighingEntry, 'id' | 'timestamp' | 'lastUpdated'>) => void;
  updateEntry: (id: string, entry: Partial<WeighingEntry>) => void;
  getKnownVehicles: () => { licensePlate: string; emptyWeight?: number }[];
  getVehicleSummary: () => { licensePlate: string; totalCargo: number }[];
}

const WeighingContext = createContext<WeighingContextType | undefined>(undefined);

export const WeighingProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<WeighingEntry[]>([]);

  const addEntry = (entry: Omit<WeighingEntry, 'id' | 'timestamp' | 'lastUpdated'>) => {
    const now = new Date();
    const newEntry: WeighingEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: now,
      lastUpdated: now,
    };
    setEntries((prev) => [newEntry, ...prev]); // Add new entries at the beginning
  };

  const updateEntry = (id: string, updatedData: Partial<WeighingEntry>) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, ...updatedData, lastUpdated: new Date() }
          : entry
      )
    );
  };

  const getKnownVehicles = () => {
    const vehicles = new Map<string, number | undefined>();
    
    entries.forEach(entry => {
      if (!vehicles.has(entry.licensePlate) && entry.emptyWeight) {
        vehicles.set(entry.licensePlate, entry.emptyWeight);
      }
    });

    return Array.from(vehicles).map(([licensePlate, emptyWeight]) => ({
      licensePlate,
      emptyWeight
    }));
  };

  const getVehicleSummary = () => {
    const summary = new Map<string, number>();

    entries.forEach(entry => {
      if (entry.fullWeight && entry.emptyWeight) {
        const cargo = entry.fullWeight - entry.emptyWeight;
        const current = summary.get(entry.licensePlate) || 0;
        summary.set(entry.licensePlate, current + cargo);
      }
    });

    return Array.from(summary).map(([licensePlate, totalCargo]) => ({
      licensePlate,
      totalCargo
    }));
  };

  return (
    <WeighingContext.Provider value={{ entries, addEntry, updateEntry, getKnownVehicles, getVehicleSummary }}>
      {children}
    </WeighingContext.Provider>
  );
};

export const useWeighing = () => {
  const context = useContext(WeighingContext);
  if (context === undefined) {
    throw new Error('useWeighing must be used within a WeighingProvider');
  }
  return context;
};