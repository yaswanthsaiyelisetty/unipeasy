'use server';

/**
 * @fileOverview A global AI assistant that can answer any academic question
 * 
 * - answerStudentQuestion - A function that handles general academic questions
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnswerStudentQuestionInputSchema = z.object({
  question: z.string().describe('The student question to answer.'),
  context: z.string().optional().describe('Optional context about what the student is currently studying.'),
});

export type AnswerStudentQuestionInput = z.infer<typeof AnswerStudentQuestionInputSchema>;

const AnswerStudentQuestionOutputSchema = z.object({
  answer: z.string().describe('A clear, helpful answer to the student question.'),
  followUpSuggestions: z.array(z.string()).describe('2-3 suggested follow-up questions the student might want to ask.'),
});

export type AnswerStudentQuestionOutput = z.infer<typeof AnswerStudentQuestionOutputSchema>;

export async function answerStudentQuestion(
  input: AnswerStudentQuestionInput
): Promise<AnswerStudentQuestionOutput> {
  return answerStudentQuestionFlow(input);
}

const answerPrompt = ai.definePrompt({
  name: 'answerStudentQuestionPrompt',
  input: { schema: AnswerStudentQuestionInputSchema },
  output: { schema: AnswerStudentQuestionOutputSchema },
  prompt: `You are UniPeasy AI, a friendly and knowledgeable academic assistant for engineering students. Your goal is to help students understand concepts, solve problems, and succeed in their studies.

**Student's Question:** {{{question}}}

{{#if context}}
**Context:** The student is currently studying: {{{context}}}
{{/if}}

**Guidelines:**
1. Be concise but thorough - aim for clarity
2. Use simple language and real-world analogies when explaining complex concepts
3. If the question involves math or formulas, show step-by-step solutions
4. For programming questions, provide code examples when helpful
5. If you're unsure about something, acknowledge it honestly
6. Be encouraging and supportive in your tone
7. Focus on helping the student truly understand, not just giving answers

**Response Format:**
- Start with a direct answer to the question
- Provide explanation with examples if needed
- Keep the response focused and scannable

Please provide a helpful response and suggest 2-3 relevant follow-up questions the student might want to explore.`,
});

const answerStudentQuestionFlow = ai.defineFlow(
  {
    name: 'answerStudentQuestionFlow',
    inputSchema: AnswerStudentQuestionInputSchema,
    outputSchema: AnswerStudentQuestionOutputSchema,
  },
  async (input) => {
    const { output } = await answerPrompt(input);
    return output!;
  }
);
