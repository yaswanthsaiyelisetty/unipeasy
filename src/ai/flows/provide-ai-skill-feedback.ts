'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI feedback for a specific skill challenge.
 *
 * - provideAiSkillFeedback - A function that takes the user's input and challenge details and generates feedback.
 * - ProvideAiSkillFeedbackInput - The input type for the function.
 * - ProvideAiSkillFeedbackOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideAiSkillFeedbackInputSchema = z.object({
  skillName: z.string().describe('The name of the skill track (e.g., "Python for Data Science").'),
  level: z.number().describe('The level number within the skill track.'),
  challenge: z.string().describe('The title of the challenge for the level.'),
  challengeDescription: z.string().describe('The description or instructions for the challenge.'),
  userInput: z.string().describe("The user's submission (code, text, etc.)."),
});
export type ProvideAiSkillFeedbackInput = z.infer<typeof ProvideAiSkillFeedbackInputSchema>;

const ProvideAiSkillFeedbackOutputSchema = z.object({
  isCorrect: z.boolean().describe('A boolean indicating if the user\'s submission correctly solves the challenge.'),
  feedback: z.string().describe("Constructive feedback on the user's submission, explaining what was done well and what could be improved."),
  suggestion: z.string().describe("A specific, actionable suggestion for the user's next step, such as what to practice or a hint for correction."),
});
export type ProvideAiSkillFeedbackOutput = z.infer<typeof ProvideAiSkillFeedbackOutputSchema>;

export async function provideAiSkillFeedback(input: ProvideAiSkillFeedbackInput): Promise<ProvideAiSkillFeedbackOutput> {
  return provideAiSkillFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAiSkillFeedbackPrompt',
  input: {schema: ProvideAiSkillFeedbackInputSchema},
  output: {schema: ProvideAiSkillFeedbackOutputSchema},
  prompt: `You are an AI expert for the skill: {{{skillName}}}. You are evaluating a user's submission for a specific challenge.

Skill: {{{skillName}}}
Level: {{{level}}}
Challenge: {{{challenge}}}
Challenge Instructions: {{{challengeDescription}}}

User's Submission:
\`\`\`
{{{userInput}}}
\`\`\`

Your Task:
1.  **Evaluate Correctness**: Analyze the user's submission to determine if it correctly and completely solves the challenge. Set \`isCorrect\` to true or false.
2.  **Provide Feedback**: Write a constructive \`feedback\` message. Start with a positive remark. Explain why the submission is correct or incorrect. If incorrect, pinpoint the specific error. If correct, suggest a more efficient or elegant way to do it, if applicable.
3.  **Suggest Next Steps**: Provide a clear, actionable \`suggestion\`. If the submission was incorrect, give a hint to help them fix it. If it was correct, suggest a related concept to explore next or a good next level.
`,
});

const provideAiSkillFeedbackFlow = ai.defineFlow(
  {
    name: 'provideAiSkillFeedbackFlow',
    inputSchema: ProvideAiSkillFeedbackInputSchema,
    outputSchema: ProvideAiSkillFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to generate feedback. Please try again.");
    }
    return output;
  }
);
