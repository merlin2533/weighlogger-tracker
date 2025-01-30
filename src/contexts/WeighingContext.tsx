import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WeighingEntry {
  id: string;
  licensePlate: string;
  fullWeight?: number;
  emptyWeight?: number;
  cargoType?: 'Holz' | 'Kies' | 'Müll' | 'Papier' | 'Sand' | 'Aushub' | 'gesiebte Erde fein' | 'gesiebte Erde Grob' | 'Steine' | 'Lego Steine (Beton)' | 'Chipsi Mais' | 'Seramis' | 'Kronkorken' | 'Dosen';
  timestamp: Date;
  lastUpdated: Date;
}

interface WeighingContextType {
  entries: WeighingEntry[];
  addEntry: (entry: Omit<WeighingEntry, 'id' | 'timestamp' | 'lastUpdated'>) => void;
  updateEntry: (id: string, entry: Partial<WeighingEntry>) => void;
  deleteEntry: (id: string) => void;
  importTransactions: (transactions: WeighingEntry[]) => void;
  getKnownVehicles: () => { licensePlate: string; emptyWeight?: number }[];
  getVehicleSummary: () => { licensePlate: string; totalCargo: number }[];
  getDailyCargoTypeSummary: () => { cargoType: string; totalWeight: number }[];
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
    setEntries((prev) => [newEntry, ...prev]);
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

  const deleteEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const importTransactions = (transactions: WeighingEntry[]) => {
    setEntries(transactions);
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

  const getDailyCargoTypeSummary = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const summary = new Map<string, number>();
    
    entries.forEach(entry => {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      
      if (
        entryDate.getTime() === today.getTime() && 
        entry.fullWeight && 
        entry.emptyWeight && 
        entry.cargoType
      ) {
        const cargo = entry.fullWeight - entry.emptyWeight;
        const current = summary.get(entry.cargoType) || 0;
        summary.set(entry.cargoType, current + cargo);
      }
    });

    return Array.from(summary).map(([cargoType, totalWeight]) => ({
      cargoType,
      totalWeight
    })).sort((a, b) => b.totalWeight - a.totalWeight);
  };

  return (
    <WeighingContext.Provider value={{ 
      entries, 
      addEntry, 
      updateEntry, 
      deleteEntry,
      importTransactions,
      getKnownVehicles, 
      getVehicleSummary,
      getDailyCargoTypeSummary 
    }}>
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
