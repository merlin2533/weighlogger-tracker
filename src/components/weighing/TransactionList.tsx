
import { useState } from "react";
import { useWeighing } from "@/contexts/WeighingContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Trash2, Edit, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import * as XLSX from 'xlsx';

export const TransactionList = () => {
  const { entries, updateEntry, deleteEntry, importTransactions } = useWeighing();
  const [editingEntry, setEditingEntry] = useState<any>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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

  const handleDelete = (id: string) => {
    deleteEntry(id);
    toast.success("Transaktion wurde gelöscht");
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

  return (
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
                            <option value="Kronkorken">Kronkorken</option>
                            <option value="Dosen">Dosen</option>
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
  );
};
