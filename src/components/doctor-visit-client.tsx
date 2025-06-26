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
    const medicationAdherence = `Adherence rate: ${adherence.adherenceRate}%. Taken: ${adherence.taken} doses, Skipped: ${adherence.skipped} doses.`;
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
                title: "Error",
                description: "Failed to generate prompt. The result was empty.",
            });
        }
    } catch (error) {
        console.error(error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "An error occurred while generating the prompt.",
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
          <CardTitle>Prepare for Your Visit</CardTitle>
          <CardDescription>
            Generate a list of questions to discuss with your doctor based on your medication adherence and observations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="health-details">Additional Health Details</Label>
            <Textarea
              id="health-details"
              placeholder="e.g., Any new symptoms, side effects, or concerns you want to discuss..."
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
            Generate Questions
          </Button>
        </CardContent>
      </Card>
      
      <Card className="min-h-[300px]">
        <CardHeader>
          <CardTitle>Your Discussion Points</CardTitle>
          <CardDescription>Use these questions to guide your conversation with the doctor.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Generating your personalized questions...</p>
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
                <p className="text-muted-foreground">Your generated questions will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
