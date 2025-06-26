"use client";

import { useState } from "react";
import { usePillPalStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";
import type { GenerateDoctorVisitPromptInput, GenerateDoctorVisitPromptOutput } from "@/ai/flows/generate-doctor-visit-prompt";

type GeneratePromptAction = (input: GenerateDoctorVisitPromptInput) => Promise<GenerateDoctorVisitPromptOutput>;

interface DoctorVisitClientProps {
    generatePromptAction: GeneratePromptAction;
}

export function DoctorVisitClient({ generatePromptAction }: DoctorVisitClientProps) {
  const { medications, getAdherence } = usePillPalStore();
  const [healthDetails, setHealthDetails] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGeneratePrompt = async () => {
    setIsLoading(true);
    setGeneratedPrompt("");

    const adherence = getAdherence();
    const medicationAdherence = `Taxa de adesão: ${adherence.adherenceRate}%. Doses tomadas: ${adherence.taken}, Doses não tomadas: ${adherence.skipped}.`;
    const observations = medications.map(m => `- ${m.name}: ${m.observations}`).join('\n');
    
    try {
        const result = await generatePromptAction({
            medicationAdherence,
            observations,
            healthDetails,
        });
        if (result.prompt) {
            setGeneratedPrompt(result.prompt);
        } else {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Falha ao gerar o prompt. O resultado estava vazio.",
            });
        }
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Erro",
            description: "Ocorreu um erro ao gerar o prompt.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  const formattedPrompt = generatedPrompt.split('\n').map((line, index) => {
    line = line.trim();
    if (line.startsWith("- ") || /^\d+\.\s/.test(line)) {
        return <li key={index} className="mb-2">{line.replace(/^-|\d+\./, '').trim()}</li>;
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Prepare-se para a sua consulta</CardTitle>
          <CardDescription>
            Gere uma lista de perguntas para discutir com o seu médico, com base na sua adesão à medicação e observações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="health-details">Detalhes de Saúde Adicionais</Label>
            <Textarea
              id="health-details"
              placeholder="Ex: novos sintomas, efeitos colaterais ou preocupações que você queira discutir..."
              value={healthDetails}
              onChange={(e) => setHealthDetails(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button onClick={handleGeneratePrompt} disabled={isLoading} className="w-full">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Gerar Perguntas
          </Button>
        </CardContent>
      </Card>
      
      <Card className="min-h-[300px]">
        <CardHeader>
          <CardTitle>Seus Pontos para Discussão</CardTitle>
          <CardDescription>Use estas perguntas para guiar a sua conversa com o médico.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">A gerar as suas perguntas personalizadas...</p>
            </div>
          )}
          {generatedPrompt && !isLoading && (
            <ul className="list-disc pl-5 space-y-2 text-sm text-foreground">
                {formattedPrompt}
            </ul>
          )}
          {!generatedPrompt && !isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4"/>
                <p className="text-muted-foreground">As suas perguntas geradas aparecerão aqui.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
