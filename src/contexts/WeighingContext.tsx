import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface WeighingEntry {
  id: string;
  licensePlate: string;
  fullWeight?: number;
  emptyWeight?: number;
  cargoType?: 'Holz' | 'Kies' | 'Müll' | 'Papier' | 'Sand';
  timestamp: Date;
}

interface WeighingContextType {
  entries: WeighingEntry[];
  addEntry: (entry: Omit<WeighingEntry, 'id' | 'timestamp'>) => void;
  updateEntry: (id: string, entry: Partial<WeighingEntry>) => void;
}

const WeighingContext = createContext<WeighingContextType | undefined>(undefined);

export const WeighingProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<WeighingEntry[]>([]);

  const addEntry = (entry: Omit<WeighingEntry, 'id' | 'timestamp'>) => {
    const newEntry: WeighingEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setEntries((prev) => [...prev, newEntry]);
  };

  const updateEntry = (id: string, updatedData: Partial<WeighingEntry>) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, ...updatedData } : entry
      )
    );
  };

  return (
    <WeighingContext.Provider value={{ entries, addEntry, updateEntry }}>
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