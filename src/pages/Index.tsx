
import { WeighingForm } from "@/components/weighing/WeighingForm";
import { TransactionList } from "@/components/weighing/TransactionList";
import { VehicleSummary } from "@/components/weighing/VehicleSummary";
import { DailySummary } from "@/components/weighing/DailySummary";
import { DailyCargoTypeSummary } from "@/components/weighing/DailyCargoTypeSummary";
import { EmptyWeightManager } from "@/components/weighing/EmptyWeightManager";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const Index = () => {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Wiegestation IG Modelltrucker Neckar-Alb</h1>
      </div>

      <WeighingForm />

      <Accordion type="multiple" className="space-y-4">
        <AccordionItem value="transactions">
          <AccordionTrigger className="bg-white px-6 rounded-lg hover:no-underline hover:bg-gray-50">
            Transaktionen
          </AccordionTrigger>
          <AccordionContent>
            <TransactionList />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="vehicle-summary">
          <AccordionTrigger className="bg-white px-6 rounded-lg hover:no-underline hover:bg-gray-50">
            Gesamtübersicht pro Fahrzeug
          </AccordionTrigger>
          <AccordionContent>
            <VehicleSummary />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="daily-summary">
          <AccordionTrigger className="bg-white px-6 rounded-lg hover:no-underline hover:bg-gray-50">
            Tagesleistung
          </AccordionTrigger>
          <AccordionContent>
            <DailySummary />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="daily-cargo-summary">
          <AccordionTrigger className="bg-white px-6 rounded-lg hover:no-underline hover:bg-gray-50">
            Tagesleistung nach Materialart
          </AccordionTrigger>
          <AccordionContent>
            <DailyCargoTypeSummary />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="empty-weights">
          <AccordionTrigger className="bg-white px-6 rounded-lg hover:no-underline hover:bg-gray-50">
            Fahrzeug-Leergewichte
          </AccordionTrigger>
          <AccordionContent>
            <EmptyWeightManager />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Index;
