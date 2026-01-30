'use server';

/**
 * @fileOverview An AI agent that generates an even simpler explanation of a complex topic if a user fails a quiz.
 *
 * - generateEvenSimplerExplanation - A function that handles the generation of the simpler explanation.
 * - GenerateEvenSimplerExplanationInput - The input type for the function.
 * - GenerateEvenSimplerExplanationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  input: {schema: GenerateEvenSimplerExplanationInputSchema},
  output: {
    schema: GenerateEvenSimplerExplanationOutputSchema,
  },
  prompt: `You are an expert educator, specializing in making very complex topics extremely simple. A student has just failed a quiz on the topic of "{{{topic}}}".

  Your task is to re-explain the topic in the simplest possible terms. Assume they have no prior knowledge. Use very basic language and a concrete, relatable analogy. Avoid all jargon. Keep it short and focused on the absolute core concept.
  
  **FORMATTING RULES:**
  - Use **bold** for the most important key terms (2-3 terms max)
  - Break into 2-3 short paragraphs for easy reading
  - Start with a one-sentence summary
  - Use bullet points if listing anything
  - Keep sentences short and simple`,
});

const generateEvenSimplerExplanationFlow = ai.defineFlow(
  {
    name: 'generateEvenSimplerExplanationFlow',
    inputSchema: GenerateEvenSimplerExplanationInputSchema,
    outputSchema: GenerateEvenSimplerExplanationOutputSchema,
  },
  async input => {
    const {output} = await simplerExplanationPrompt(input);
    if (!output) {
      throw new Error('Failed to generate a simpler explanation.');
    }
    
    return output;
  }
);
