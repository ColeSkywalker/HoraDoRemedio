"use client";

import Link from "next/link";
import { usePillPalStore } from "@/lib/store";
import { Medication, Dose, DoseStatus } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, Pill, Plus } from "lucide-react";
import { format, isToday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const translateStatus = (status: DoseStatus) => {
  switch (status) {
    case "taken":
      return "Tomado";
    case "skipped":
      return "Não Tomado";
    case "pending":
      return "Pendente";
  }
};

export function DashboardClient() {
  const { doses, medications, updateDoseStatus } = usePillPalStore();
  const { toast } = useToast();

  const todayDoses = doses
    .filter((dose) => isToday(dose.scheduledTime))
    .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());

  const getMedicationById = (id: string): Medication | undefined => {
    return medications.find((med) => med.id === id);
  };

  const handleUpdateStatus = (dose: Dose, status: DoseStatus) => {
    updateDoseStatus(dose.id, status);
    const med = getMedicationById(dose.medicationId);
    toast({
      title: "Dose Atualizada",
      description: `${med?.name} marcado como ${translateStatus(status).toLowerCase()}.`,
      duration: 3000,
    });
  };

  if (todayDoses.length === 0) {
    return (
        <>
            <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                <Pill className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold font-headline mb-2">Tudo limpo por hoje!</h2>
                <p className="text-muted-foreground">Você não tem medicamentos agendados para o resto do dia.</p>
            </div>
            <Link href="/medications" passHref>
                <Button
                aria-label="Adicionar Medicamento"
                className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg z-40"
                size="icon"
                >
                <Plus className="h-8 w-8" />
                <span className="sr-only">Adicionar Medicamento</span>
                </Button>
            </Link>
        </>
    );
  }

  const upcomingDoses = todayDoses.filter(d => d.status === 'pending');
  const pastDoses = todayDoses.filter(d => d.status !== 'pending');

  return (
    <>
        <div className="space-y-8">
        {upcomingDoses.length > 0 && (
            <div>
                <h2 className="text-2xl font-bold font-headline mb-4">Próximas Doses</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingDoses.map((dose) => {
                    const med = getMedicationById(dose.medicationId);
                    if (!med) return null;
                    return (
                    <Card key={dose.id} className="transition-all hover:shadow-md">
                        <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pill className="text-primary"/>
                            {med.name}
                        </CardTitle>
                        <CardDescription>{med.dosage}</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>Agendado para {format(dose.scheduledTime, "p")}</span>
                        </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(dose, "skipped")}>
                            <X className="mr-2 h-4 w-4" /> Pular dose
                        </Button>
                        <Button size="sm" onClick={() => handleUpdateStatus(dose, "taken")}>
                            <Check className="mr-2 h-4 w-4" /> Tomar
                        </Button>
                        </CardFooter>
                    </Card>
                    );
                })}
                </div>
            </div>
        )}

        {pastDoses.length > 0 && (
            <div>
                <h2 className="text-2xl font-bold font-headline mb-4">Histórico de Hoje</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pastDoses.map((dose) => {
                    const med = getMedicationById(dose.medicationId);
                    if (!med) return null;
                    return (
                    <Card key={dose.id} className={cn("opacity-70", dose.status === 'taken' ? 'bg-green-50' : 'bg-red-50')}>
                        <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Pill className="text-primary"/>
                                {med.name}
                            </div>
                            <Badge variant={dose.status === "taken" ? "default" : "destructive"} className={cn(dose.status === 'taken' && "bg-green-600")}>
                            {translateStatus(dose.status)}
                            </Badge>
                        </CardTitle>
                        <CardDescription>{med.dosage}</CardDescription>
                        </CardHeader>
                        <CardContent>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{format(dose.scheduledTime, "p")}</span>
                        </div>
                        </CardContent>
                    </Card>
                    );
                })}
                </div>
            </div>
        )}
        </div>
        <Link href="/medications" passHref>
            <Button
                aria-label="Adicionar Medicamento"
                className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg z-40"
                size="icon"
            >
                <Plus className="h-8 w-8" />
                <span className="sr-only">Adicionar Medicamento</span>
            </Button>
        </Link>
    </>
  );
}
