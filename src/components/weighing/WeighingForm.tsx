
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWeighing } from "@/contexts/WeighingContext";

export const WeighingForm = () => {
  const { entries, addEntry, updateEntry, getKnownVehicles } = useWeighing();
  const [licensePlate, setLicensePlate] = useState("");
  const [weight, setWeight] = useState("");
  const [cargoType, setCargoType] = useState<"Holz" | "Kies" | "Müll" | "Papier" | "Sand" | "Aushub" | "gesiebte Erde fein" | "gesiebte Erde Grob" | "Steine" | "Lego Steine (Beton)" | "Chipsi Mais" | "Seramis" | "Kronkorken" | "Dosen">("Holz");

  const handleWeighing = () => {
    const knownVehicles = getKnownVehicles();
    const knownVehicle = knownVehicles.find(v => v.licensePlate === licensePlate);
    
    const existingEntry = entries.find(
      (e) => e.licensePlate === licensePlate && !e.emptyWeight
    );

    if (existingEntry) {
      updateEntry(existingEntry.id, { emptyWeight: Number(weight) });
    } else {
      addEntry({
        licensePlate,
        fullWeight: Number(weight),
        cargoType,
        emptyWeight: knownVehicle?.emptyWeight,
      });
    }

    setLicensePlate("");
    setWeight("");
  };

  const knownVehicles = getKnownVehicles();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-bold">Wagenprotokoll</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col space-y-2">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
          >
            <option value="">Neues Kennzeichen...</option>
            {knownVehicles.map((vehicle) => (
              <option key={vehicle.licensePlate} value={vehicle.licensePlate}>
                {vehicle.licensePlate}
              </option>
            ))}
          </select>
          {!knownVehicles.find(v => v.licensePlate === licensePlate) && (
            <Input
              placeholder="Neues Kennzeichen"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
            />
          )}
        </div>
        <Input
          type="number"
          placeholder="Gewicht (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
        <select
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={cargoType}
          onChange={(e) => setCargoType(e.target.value as any)}
        >
          <option value="Holz">Holz</option>
          <option value="Kies">Kies</option>
          <option value="Müll">Müll</option>
          <option value="Papier">Papier</option>
          <option value="Sand">Sand</option>
          <option value="Aushub">Aushub</option>
          <option value="gesiebte Erde fein">gesiebte Erde fein</option>
          <option value="gesiebte Erde Grob">gesiebte Erde Grob</option>
          <option value="Steine">Steine</option>
          <option value="Lego Steine (Beton)">Lego Steine (Beton)</option>
          <option value="Chipsi Mais">Chipsi Mais</option>
          <option value="Seramis">Seramis</option>
          <option value="Kronkorken">Kronkorken</option>
          <option value="Dosen">Dosen</option>
        </select>
        <Button onClick={handleWeighing}>Wiegen</Button>
      </div>
    </div>
  );
};
