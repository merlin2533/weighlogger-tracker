
import { useWeighing } from "@/contexts/WeighingContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const DailySummary = () => {
  const { entries } = useWeighing();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
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

  const dailyTotal = calculateDailyTotal();

  return (
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
  );
};
