'use server';
/**
 * @fileOverview This file defines a Genkit flow to generate a doctor visit prompt based on medication adherence, observations, and health details.
 *
 * - generateDoctorVisitPrompt - Uma função que gera o prompt para a visita ao médico.
 * - GenerateDoctorVisitPromptInput - O tipo de entrada para a função generateDoctorVisitPrompt.
 * - GenerateDoctorVisitPromptOutput - O tipo de retorno para a função generateDoctorVisitPrompt.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDoctorVisitPromptInputSchema = z.object({
  medicationAdherence: z.string().describe('Resumo da adesão à medicação.'),
  observations: z.string().describe('Observações do usuário sobre sua saúde e medicamentos.'),
  healthDetails: z.string().describe('Detalhes importantes relacionados à saúde.'),
});
export type GenerateDoctorVisitPromptInput = z.infer<
  typeof GenerateDoctorVisitPromptInputSchema
>;

const GenerateDoctorVisitPromptOutputSchema = z.object({
  prompt: z.string().describe('O prompt gerado para a visita ao médico.'),
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
  prompt: `Aqui está um resumo da adesão do paciente à medicação, suas observações e detalhes importantes de saúde. Use estas informações para guiar a conversa clínica com o paciente.

Adesão à Medicação: {{{medicationAdherence}}}

Observações: {{{observations}}}

Detalhes de Saúde: {{{healthDetails}}}

Com base nestas informações, que perguntas devo fazer ao paciente para entender melhor seu estado de saúde atual e suas necessidades de medicação? Por favor, formate sua resposta como uma lista de perguntas.`,
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
