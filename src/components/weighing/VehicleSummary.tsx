
import { useWeighing } from "@/contexts/WeighingContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';

export const VehicleSummary = () => {
  const { getVehicleSummary } = useWeighing();
  const vehicleSummary = getVehicleSummary().sort((a, b) => b.totalCargo - a.totalCargo);

  const handleExportSummary = () => {
    const data = vehicleSummary.map(summary => ({
      Kennzeichen: summary.licensePlate,
      "Gesamtgewicht transportiert": `${summary.totalCargo} kg`
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "Fahrzeug-Übersicht.xlsx");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Gesamtübersicht pro Fahrzeug</h2>
        <Button onClick={handleExportSummary} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Als Excel exportieren
        </Button>
      </div>
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
  );
};
