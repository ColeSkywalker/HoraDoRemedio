"use client";

import { useState } from "react";
import { usePillPalStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pill, Clock, MessageSquare } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const medicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  dosage: z.string().min(1, "Dosage is required."),
  observations: z.string().optional(),
  frequency: z.enum(["8", "12", "24"]),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)."),
});

export function MedicationsClient() {
  const { medications, addMedication } = usePillPalStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof medicationSchema>>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      observations: "",
      frequency: "24",
      startTime: "08:00",
    },
  });

  function onSubmit(values: z.infer<typeof medicationSchema>) {
    addMedication({
      ...values,
      frequency: parseInt(values.frequency, 10) as 8 | 12 | 24,
      observations: values.observations || "",
    });
    toast({
      title: "Medication Added",
      description: `${values.name} has been added to your list.`,
    });
    form.reset();
    setIsDialogOpen(false);
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
              <DialogDescription>
                Fill in the details of your new medication.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medication Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Paracetamol" {...field} />
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
                      <FormLabel>Dosage</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 500mg" {...field} />
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
                        <FormLabel>Frequency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="8">Every 8 hours</SelectItem>
                            <SelectItem value="12">Every 12 hours</SelectItem>
                            <SelectItem value="24">Every 24 hours</SelectItem>
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
                        <FormLabel>First Dose Time</FormLabel>
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
                      <FormLabel>Observations</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., Take with a meal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                  </DialogClose>
                  <Button type="submit">Add Medication</Button>
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
                    <span>Every {med.frequency} hours, starting at {med.startTime}</span>
                </div>
                {med.observations && (
                    <div className="flex items-start text-sm text-muted-foreground">
                        <MessageSquare className="mr-2 h-4 w-4 flex-shrink-0 mt-1" />
                        <p>{med.observations}</p>
                    </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Pill className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-medium">No medications found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                Click "Add Medication" to get started.
            </p>
        </div>
      )}
    </div>
  );
}
