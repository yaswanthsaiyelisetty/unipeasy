'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI feedback after each training module.
 *
 * - provideAiFeedback - A function that takes the user's input and module content and generates feedback.
 * - ProvideAiFeedbackInput - The input type for the provideAiFeedback function.
 * - ProvideAiFeedbackOutput - The return type for the provideAiFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideAiFeedbackInputSchema = z.object({
  userInput: z.string().describe('The user input or response to the training module.'),
  moduleContent: z.string().describe('The content of the training module.'),
  userName: z.string().describe('The name of the user.'),
});
export type ProvideAiFeedbackInput = z.infer<typeof ProvideAiFeedbackInputSchema>;

const ProvideAiFeedbackOutputSchema = z.object({
  feedback: z.string().describe('The AI-generated feedback for the user.'),
});
export type ProvideAiFeedbackOutput = z.infer<typeof ProvideAiFeedbackOutputSchema>;

export async function provideAiFeedback(input: ProvideAiFeedbackInput): Promise<ProvideAiFeedbackOutput> {
  return provideAiFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAiFeedbackPrompt',
  input: {schema: ProvideAiFeedbackInputSchema},
  output: {schema: ProvideAiFeedbackOutputSchema},
  prompt: `You are an AI assistant providing feedback to the user {{userName}} after they completed a training module. 

  The module content was:
  {{moduleContent}}

  The user's response was:
  {{userInput}}

  Provide constructive and actionable feedback to the user to help them improve their skills. The feedback should be specific to the user's input and the module content, and it should be no more than a few sentences long. It should always start with a positive remark.
`,
});

const provideAiFeedbackFlow = ai.defineFlow(
  {
    name: 'provideAiFeedbackFlow',
    inputSchema: ProvideAiFeedbackInputSchema,
    outputSchema: ProvideAiFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
