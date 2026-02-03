'use server';

/**
 * @fileOverview An AI agent that generates an even simpler explanation of a complex topic if a user fails a quiz.
 *
 * - generateEvenSimplerExplanation - A function that handles the generation of the simpler explanation.
 * - GenerateEvenSimplerExplanationInput - The input type for the function.
 * - GenerateEvenSimplerExplanationOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateEvenSimplerExplanationInputSchema = z.object({
  topic: z.string().describe('The complex topic to be re-explained in the simplest possible terms.'),
});
export type GenerateEvenSimplerExplanationInput = z.infer<typeof GenerateEvenSimplerExplanationInputSchema>;

const GenerateEvenSimplerExplanationOutputSchema = z.object({
  simplerExplanation: z
    .string()
    .describe('An even simpler explanation of the topic, suitable for someone who is struggling to understand.'),
});
export type GenerateEvenSimplerExplanationOutput = z.infer<typeof GenerateEvenSimplerExplanationOutputSchema>;


export async function generateEvenSimplerExplanation(
  input: GenerateEvenSimplerExplanationInput
): Promise<GenerateEvenSimplerExplanationOutput> {
  return generateEvenSimplerExplanationFlow(input);
}

const simplerExplanationPrompt = ai.definePrompt({
  name: 'generateEvenSimplerExplanationPrompt',
  input: { schema: GenerateEvenSimplerExplanationInputSchema },
  output: {
    schema: GenerateEvenSimplerExplanationOutputSchema,
  },
  prompt: `You are an expert educator who makes complex topics EXTREMELY simple. A student failed a quiz on "{{{topic}}}" and needs a simpler explanation.

  **YOUR TASK:** Re-explain in the SIMPLEST possible terms. Assume ZERO prior knowledge.

  **USE THIS EXACT FORMAT:**

  ## 🎯 In One Sentence
  (Define the concept in ONE simple sentence a 10-year-old would understand)

  ## 🏠 Real-Life Example
  (Give ONE concrete, everyday example - max 2 sentences)

  ## 🔑 The 3 Things to Remember
  - Point 1 (max 10 words)
  - Point 2 (max 10 words)
  - Point 3 (max 10 words)

  **RULES:**
  - NO jargon or technical terms
  - Use **bold** only for 2-3 key words
  - Keep TOTAL response under 100 words
  - Use simple, everyday language`,
});

const generateEvenSimplerExplanationFlow = ai.defineFlow(
  {
    name: 'generateEvenSimplerExplanationFlow',
    inputSchema: GenerateEvenSimplerExplanationInputSchema,
    outputSchema: GenerateEvenSimplerExplanationOutputSchema,
  },
  async input => {
    const { output } = await simplerExplanationPrompt(input);
    if (!output) {
      throw new Error('Failed to generate a simpler explanation.');
    }

    return output;
  }
);
