import { useState, useRef } from "react";
import { useWeighing } from "@/contexts/WeighingContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const EmptyWeightManager = () => {
  const { entries, addEntry, updateEntry, getKnownVehicles } = useWeighing();
  const [newEmptyWeight, setNewEmptyWeight] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleExport = () => {
    const vehicles = getKnownVehicles();
    if (vehicles.length === 0) {
      toast.error("Keine Fahrzeuge zum Exportieren vorhanden");
      return;
    }

    const exportData = vehicles.map(v => ({
      Kennzeichen: v.licensePlate,
      "Leergewicht (kg)": v.emptyWeight || ""
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fahrzeuge");
    XLSX.writeFile(wb, "fahrzeug-leergewichte.xlsx");
    toast.success("Export erfolgreich");
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        let importedCount = 0;
        jsonData.forEach((row: any) => {
          const licensePlate = row.Kennzeichen || row.kennzeichen;
          const emptyWeight = Number(row["Leergewicht (kg)"] || row.Leergewicht || row.leergewicht);

          if (licensePlate && emptyWeight) {
            const existingEntry = entries.find(e => e.licensePlate === licensePlate);
            if (existingEntry) {
              updateEntry(existingEntry.id, { emptyWeight });
            } else {
              addEntry({ licensePlate, emptyWeight });
            }
            importedCount++;
          }
        });

        toast.success(`${importedCount} Fahrzeug(e) importiert`);
      } catch (error) {
        toast.error("Fehler beim Importieren der Datei");
        console.error(error);
      }
    };
    reader.readAsArrayBuffer(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fahrzeug-Leergewichte</h2>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            ref={fileInputRef}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
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
