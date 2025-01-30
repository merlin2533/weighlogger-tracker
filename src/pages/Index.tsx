import { useWeighing } from "@/contexts/WeighingContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Index = () => {
  const { entries, addEntry, updateEntry, getKnownVehicles, getVehicleSummary } = useWeighing();
  const [licensePlate, setLicensePlate] = useState("");
  const [weight, setWeight] = useState("");
  const [cargoType, setCargoType] = useState<"Holz" | "Kies" | "Müll" | "Papier" | "Sand" | "Aushub" | "gesiebte Erde fein" | "gesiebte Erde Grob">("Holz");

  const handleWeighing = () => {
    const knownVehicles = getKnownVehicles();
    const knownVehicle = knownVehicles.find(v => v.licensePlate === licensePlate);
    
    const existingEntry = entries.find(
      (e) => e.licensePlate === licensePlate && !e.emptyWeight
    );

    if (existingEntry) {
      // Second weighing (empty weight)
      updateEntry(existingEntry.id, { emptyWeight: Number(weight) });
    } else {
      // First weighing (full weight)
      addEntry({
        licensePlate,
        fullWeight: Number(weight),
        cargoType,
        // If we know the empty weight from previous transactions, use it
        emptyWeight: knownVehicle?.emptyWeight,
      });
    }

    setLicensePlate("");
    setWeight("");
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const knownVehicles = getKnownVehicles();
  const vehicleSummary = getVehicleSummary();

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Wiegestation IG Modelltrucker Neckar-Alb</h1>
      </div>

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
          </select>
          <Button onClick={handleWeighing}>Wiegen</Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Transaktionen</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kennzeichen</TableHead>
              <TableHead>Vollgewicht</TableHead>
              <TableHead>Leergewicht</TableHead>
              <TableHead>Differenz</TableHead>
              <TableHead>Ladung</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Letztes Update</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{entry.licensePlate}</TableCell>
                <TableCell>{entry.fullWeight} kg</TableCell>
                <TableCell>{entry.emptyWeight || "-"} kg</TableCell>
                <TableCell>
                  {entry.fullWeight && entry.emptyWeight
                    ? `${entry.fullWeight - entry.emptyWeight} kg`
                    : "-"}
                </TableCell>
                <TableCell>{entry.cargoType}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${
                      entry.emptyWeight ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {entry.emptyWeight ? "Abgeschlossen" : "Offen"}
                  </span>
                </TableCell>
                <TableCell>{formatDate(entry.timestamp)}</TableCell>
                <TableCell>{formatDate(entry.lastUpdated)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Gesamtübersicht pro Fahrzeug</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kennzeichen</TableHead>
              <TableHead>Gesamtgewicht transportiert</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicleSummary.map((summary) => (
              <TableRow key={summary.licensePlate}>
                <TableCell>{summary.licensePlate}</TableCell>
                <TableCell>{summary.totalCargo} kg</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Index;