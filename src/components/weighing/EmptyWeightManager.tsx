
import { useState } from "react";
import { useWeighing } from "@/contexts/WeighingContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { toast } from "sonner";

export const EmptyWeightManager = () => {
  const { entries, addEntry, updateEntry, getKnownVehicles } = useWeighing();
  const [newEmptyWeight, setNewEmptyWeight] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleEmptyWeightUpdate = () => {
    const weight = Number(newEmptyWeight);
    if (!selectedVehicle || !weight) {
      toast.error("Bitte Fahrzeug und Gewicht angeben");
      return;
    }

    const existingEntry = entries.find(e => e.licensePlate === selectedVehicle);
    if (existingEntry) {
      updateEntry(existingEntry.id, { emptyWeight: weight });
      toast.success("Leergewicht wurde aktualisiert");
    } else {
      addEntry({
        licensePlate: selectedVehicle,
        emptyWeight: weight
      });
      toast.success("Leergewicht wurde gespeichert");
    }

    setNewEmptyWeight("");
    setSelectedVehicle("");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-2xl font-bold">Fahrzeug-Leergewichte</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          placeholder="Kennzeichen"
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Leergewicht (kg)"
          value={newEmptyWeight}
          onChange={(e) => setNewEmptyWeight(e.target.value)}
        />
        <Button onClick={handleEmptyWeightUpdate}>Leergewicht speichern</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kennzeichen</TableHead>
            <TableHead>Leergewicht</TableHead>
            <TableHead>Zuletzt aktualisiert</TableHead>
            <TableHead>Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {getKnownVehicles().map((vehicle) => (
            <TableRow key={vehicle.licensePlate}>
              <TableCell>{vehicle.licensePlate}</TableCell>
              <TableCell>{vehicle.emptyWeight} kg</TableCell>
              <TableCell>
                {entries.find(e => e.licensePlate === vehicle.licensePlate)?.lastUpdated 
                  ? formatDate(entries.find(e => e.licensePlate === vehicle.licensePlate)!.lastUpdated)
                  : "-"}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedVehicle(vehicle.licensePlate);
                    setNewEmptyWeight(vehicle.emptyWeight?.toString() || "");
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
