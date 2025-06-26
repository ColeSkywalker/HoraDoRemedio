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
    { name: "Taken", value: adherenceData.taken, fill: "hsl(var(--chart-1))" },
    { name: "Skipped", value: adherenceData.skipped, fill: "hsl(var(--chart-2))" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Adherence Rate</CardTitle>
            <CardDescription>Based on doses in the past.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-headline text-primary">
              {adherenceData.adherenceRate}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Doses Taken</CardTitle>
            <CardDescription>Total doses marked as taken.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-headline">{adherenceData.taken}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Doses Skipped</CardTitle>
            <CardDescription>Total doses marked as skipped.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold font-headline">{adherenceData.skipped}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adherence Summary</CardTitle>
          <CardDescription>Visual summary of taken vs. skipped doses.</CardDescription>
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
            <CardTitle>Medication List</CardTitle>
            <CardDescription>A complete list of your registered medications.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Frequency</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {medications.map((med) => (
                        <TableRow key={med.id}>
                            <TableCell className="font-medium">{med.name}</TableCell>
                            <TableCell>{med.dosage}</TableCell>
                            <TableCell>Every {med.frequency} hours</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}
