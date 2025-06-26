"use client";

import { usePillPalStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pill } from "lucide-react";

export function ReportsClient() {
  const { getAdherence, medications } = usePillPalStore();
  const adherenceData = getAdherence();
  
  const chartData = [
    { name: "Tomadas", value: adherenceData.taken, fill: "hsl(var(--chart-1))" },
    { name: "Puladas", value: adherenceData.skipped, fill: "hsl(var(--destructive))" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Adesão</CardTitle>
            <CardDescription>Com base nas doses passadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-headline text-primary">
              {adherenceData.adherenceRate}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Doses Tomadas</CardTitle>
            <CardDescription>Total de doses marcadas como tomadas.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-headline">{adherenceData.taken}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Doses Puladas</CardTitle>
            <CardDescription>Total de doses marcadas como puladas.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-headline">{adherenceData.skipped}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo da Adesão</CardTitle>
          <CardDescription>Resumo visual de doses tomadas vs. puladas.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--background))" }}
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                  borderRadius: "var(--radius)",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle>Lista de Medicamentos</CardTitle>
            <CardDescription>Uma lista completa dos seus medicamentos registrados.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Dosagem</TableHead>
                        <TableHead>Frequência</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {medications.map((med) => (
                        <TableRow key={med.id}>
                            <TableCell className="font-medium">{med.name}</TableCell>
                            <TableCell>{med.dosage}</TableCell>
                            <TableCell>A cada {med.frequency} horas</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
