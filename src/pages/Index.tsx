import { useWeighing } from "@/contexts/WeighingContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import * as XLSX from 'xlsx';
import { Download, Trash2, Edit, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const Index = () => {
  const { entries, addEntry, updateEntry, deleteEntry, getKnownVehicles, getVehicleSummary, getDailyCargoTypeSummary, importTransactions } = useWeighing();
  const [licensePlate, setLicensePlate] = useState("");
  const [weight, setWeight] = useState("");
  const [cargoType, setCargoType] = useState<"Holz" | "Kies" | "Müll" | "Papier" | "Sand" | "Aushub" | "gesiebte Erde fein" | "gesiebte Erde Grob" | "Steine" | "Lego Steine (Beton)" | "Chipsi Mais" | "Seramis">("Holz");
  const [editingEntry, setEditingEntry] = useState<any>(null);

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

  const handleDelete = (id: string) => {
    deleteEntry(id);
    toast.success("Transaktion wurde gelöscht");
  };

  const handleEdit = (entry: any) => {
    updateEntry(entry.id, {
      licensePlate: entry.licensePlate,
      fullWeight: Number(entry.fullWeight),
      emptyWeight: Number(entry.emptyWeight),
      cargoType: entry.cargoType,
    });
    setEditingEntry(null);
    toast.success("Transaktion wurde aktualisiert");
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

  const exportToExcel = (data: any[], filename: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const handleExportTransactions = () => {
    const data = entries.map(entry => ({
      Kennzeichen: entry.licensePlate,
      Vollgewicht: entry.fullWeight,
      Leergewicht: entry.emptyWeight,
      Differenz: entry.fullWeight && entry.emptyWeight ? entry.fullWeight - entry.emptyWeight : '-',
      Ladung: entry.cargoType,
      Status: entry.emptyWeight ? "Abgeschlossen" : "Offen",
      Datum: formatDate(entry.timestamp),
      "Letztes Update": formatDate(entry.lastUpdated),
      id: entry.id,
      timestamp: entry.timestamp.toISOString(),
      lastUpdated: entry.lastUpdated.toISOString()
    }));
    exportToExcel(data, "Wiegeaktionen");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const transactions = jsonData.map((row: any) => ({
          id: row.id,
          licensePlate: row.Kennzeichen,
          fullWeight: row.Vollgewicht,
          emptyWeight: row.Leergewicht,
          cargoType: row.Ladung,
          timestamp: new Date(row.timestamp),
          lastUpdated: new Date(row.lastUpdated)
        }));

        importTransactions(transactions);
        toast.success("Transaktionen erfolgreich importiert");
      } catch (error) {
        console.error('Error importing file:', error);
        toast.error("Fehler beim Importieren der Datei");
      }
    };
    reader.readAsBinaryString(file);
  };

  const calculateDailyTotal = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return entries.reduce((total, entry) => {
      const entryDate = new Date(entry.timestamp);
      entryDate.setHours(0, 0, 0, 0);
      
      if (entryDate.getTime() === today.getTime() && entry.fullWeight && entry.emptyWeight) {
        return total + (entry.fullWeight - entry.emptyWeight);
      }
      return total;
    }, 0);
  };

  const knownVehicles = getKnownVehicles();
  const vehicleSummary = getVehicleSummary().sort((a, b) => b.totalCargo - a.totalCargo);
  const dailyTotal = calculateDailyTotal();
  const dailyCargoTypeSummary = getDailyCargoTypeSummary();

  const handleExportSummary = () => {
    const data = vehicleSummary.map(summary => ({
      Kennzeichen: summary.licensePlate,
      "Gesamtgewicht transportiert": `${summary.totalCargo} kg`
    }));
    exportToExcel(data, "Fahrzeug-Übersicht");
  };

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
            <option value="Steine">Steine</option>
            <option value="Lego Steine (Beton)">Lego Steine (Beton)</option>
            <option value="Chipsi Mais">Chipsi Mais</option>
            <option value="Seramis">Seramis</option>
          </select>
          <Button onClick={handleWeighing}>Wiegen</Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Transaktionen</h2>
          <div className="flex gap-2">
            <Button onClick={handleExportTransactions} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Als Excel exportieren
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Excel importieren
              </Button>
            </div>
          </div>
        </div>
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
              <TableHead>Aktionen</TableHead>
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
                <TableCell>
                  <div className="flex space-x-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setEditingEntry({...entry})}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Transaktion bearbeiten</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <label>Kennzeichen</label>
                            <Input
                              value={editingEntry?.licensePlate || ''}
                              onChange={(e) => setEditingEntry({...editingEntry, licensePlate: e.target.value})}
                            />
                          </div>
                          <div className="grid gap-2">
                            <label>Vollgewicht (kg)</label>
                            <Input
                              type="number"
                              value={editingEntry?.fullWeight || ''}
                              onChange={(e) => setEditingEntry({...editingEntry, fullWeight: e.target.value})}
                            />
                          </div>
                          <div className="grid gap-2">
                            <label>Leergewicht (kg)</label>
                            <Input
                              type="number"
                              value={editingEntry?.emptyWeight || ''}
                              onChange={(e) => setEditingEntry({...editingEntry, emptyWeight: e.target.value})}
                            />
                          </div>
                          <div className="grid gap-2">
                            <label>Ladung</label>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              value={editingEntry?.cargoType || ''}
                              onChange={(e) => setEditingEntry({...editingEntry, cargoType: e.target.value})}
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
                            </select>
                          </div>
                          <Button onClick={() => handleEdit(editingEntry)}>Speichern</Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Tagesleistung</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Gesamtgewicht transportiert</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>{formatDate(new Date())}</TableCell>
              <TableCell>{dailyTotal} kg</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Tagesleistung nach Materialart</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Material</TableHead>
              <TableHead>Gesamtgewicht transportiert</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dailyCargoTypeSummary.map((summary) => (
              <TableRow key={summary.cargoType}>
                <TableCell>{summary.cargoType}</TableCell>
                <TableCell>{summary.totalWeight} kg</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Index;
