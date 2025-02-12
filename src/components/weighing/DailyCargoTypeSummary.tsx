
import { useWeighing } from "@/contexts/WeighingContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const DailyCargoTypeSummary = () => {
  const { getDailyCargoTypeSummary } = useWeighing();
  const dailyCargoTypeSummary = getDailyCargoTypeSummary();

  return (
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
  );
};
