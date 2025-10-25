"use client";

import { useState } from "react";
import { usePillPalStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pill, Clock, FileText, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Medication } from "@/lib/types";

const medicationSchema = z.object({
  name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres."),
  dosage: z.string().min(1, "A dosagem é obrigatória."),
  frequency: z.enum(["8", "12", "24"]),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Formato de hora inválido (HH:mm)."),
  observations: z.string().max(200, "As observações devem ter no máximo 200 caracteres.").optional(),
});

export function MedicationsClient() {
  const { medications, addMedication, deleteMedication } = usePillPalStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof medicationSchema>>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "24",
      startTime: "08:00",
      observations: "",
    },
  });

  function onSubmit(values: z.infer<typeof medicationSchema>) {
    addMedication({
      ...values,
      frequency: parseInt(values.frequency, 10) as 8 | 12 | 24,
    });
    toast({
      title: "Medicamento Adicionado",
      description: `${values.name} foi adicionado à sua lista.`,
      duration: 3000,
    });
    form.reset();
    setIsDialogOpen(false);
  }

  function handleDelete(medication: Medication) {
    deleteMedication(medication.id);
    toast({
      title: "Medicamento Removido",
      description: `${medication.name} foi removido da sua lista.`,
      variant: "destructive",
      duration: 3000,
    });
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Adicionar Medicamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Medicamento</DialogTitle>
              <DialogDescription>
                Preencha os detalhes do seu novo medicamento.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Medicamento</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Paracetamol" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosagem</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 500mg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Frequência</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a frequência" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="8">A cada 8 horas</SelectItem>
                            <SelectItem value="12">A cada 12 horas</SelectItem>
                            <SelectItem value="24">A cada 24 horas</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Primeira Dose</FormLabel>
                        <FormControl>
                            <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <FormField
                  control={form.control}
                  name="observations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Tomar com o estômago cheio..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit">Adicionar Medicamento</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {medications.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {medications.map((med) => (
            <Card key={med.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="text-primary" /> {med.name}
                </CardTitle>
                <CardDescription>{med.dosage}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>A cada {med.frequency} horas, começando às {med.startTime}</span>
                </div>
                {med.observations && (
                  <div className="flex items-start text-sm text-muted-foreground pt-2 border-t mt-2">
                    <FileText className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="flex-1">{med.observations}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Essa ação não pode ser desfeita. Isso removerá permanentemente o
                            medicamento e todas as suas doses agendadas.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(med)}>
                            Deletar
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Pill className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">Nenhum medicamento encontrado</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Clique em "Adicionar Medicamento" para começar.
            </p>
        </div>
      )}
    </div>
  );
}
