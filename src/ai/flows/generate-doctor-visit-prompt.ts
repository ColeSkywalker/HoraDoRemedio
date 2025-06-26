'use server';
/**
 * @fileOverview This file defines a Genkit flow to generate a doctor visit prompt based on medication adherence, observations, and health details.
 *
 * - generateDoctorVisitPrompt - A function that generates the doctor visit prompt.
 * - GenerateDoctorVisitPromptInput - The input type for the generateDoctorVisitPrompt function.
 * - GenerateDoctorVisitPromptOutput - The return type for the generateDoctorVisitPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDoctorVisitPromptInputSchema = z.object({
  medicationAdherence: z.string().describe('Summary of medication adherence.'),
  observations: z.string().describe('User observations about their health and medications.'),
  healthDetails: z.string().describe('Important health-related details.'),
});
export type GenerateDoctorVisitPromptInput = z.infer<
  typeof GenerateDoctorVisitPromptInputSchema
>;

const GenerateDoctorVisitPromptOutputSchema = z.object({
  prompt: z.string().describe('The generated prompt for the doctor visit.'),
});
export type GenerateDoctorVisitPromptOutput = z.infer<
  typeof GenerateDoctorVisitPromptOutputSchema
>;

export async function generateDoctorVisitPrompt(
  input: GenerateDoctorVisitPromptInput
): Promise<GenerateDoctorVisitPromptOutput> {
  return generateDoctorVisitPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDoctorVisitPrompt',
  input: {schema: GenerateDoctorVisitPromptInputSchema},
  output: {schema: GenerateDoctorVisitPromptOutputSchema},
  prompt: `Here's a summary of the patient's medication adherence, observations, and important health details. Use this information to guide the clinical conversation with the patient.

Medication Adherence: {{{medicationAdherence}}}

Observations: {{{observations}}}

Health Details: {{{healthDetails}}}

Based on this information, what questions should I ask the patient to best understand their current health status and medication needs? Please format your response as a list of questions.`,
});

const generateDoctorVisitPromptFlow = ai.defineFlow(
  {
    name: 'generateDoctorVisitPromptFlow',
    inputSchema: GenerateDoctorVisitPromptInputSchema,
    outputSchema: GenerateDoctorVisitPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
