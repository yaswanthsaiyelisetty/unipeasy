'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing adaptive skill feedback to students after completing a training module.
 *
 * - provideAdaptiveSkillFeedback - The main function to generate feedback.
 * - ProvideAdaptiveSkillFeedbackInput - The input type for the function.
 * - ProvideAdaptiveSkillFeedbackOutput - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProvideAdaptiveSkillFeedbackInputSchema = z.object({
  moduleName: z.string().describe('The name of the training module.'),
  studentSkills: z.array(z.string()).describe('List of skills the student has.'),
  studentWeaknesses: z.array(z.string()).describe('List of skills the student needs to improve.'),
  studentPerformance: z
    .string()
    .describe('A summary of the student\'s performance in the module.'),
  feedbackRequest: z
    .string()
    .optional()
    .describe(
      'Any specific feedback requested by the student (optional). If empty, provide general feedback.'
    ),
});

export type ProvideAdaptiveSkillFeedbackInput = z.infer<
  typeof ProvideAdaptiveSkillFeedbackInputSchema
>;

const ProvideAdaptiveSkillFeedbackOutputSchema = z.object({
  feedback: z.string().describe('The AI-generated feedback for the student.'),
});

export type ProvideAdaptiveSkillFeedbackOutput = z.infer<
  typeof ProvideAdaptiveSkillFeedbackOutputSchema
>;

export async function provideAdaptiveSkillFeedback(
  input: ProvideAdaptiveSkillFeedbackInput
): Promise<ProvideAdaptiveSkillFeedbackOutput> {
  return provideAdaptiveSkillFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'provideAdaptiveSkillFeedbackPrompt',
  input: {schema: ProvideAdaptiveSkillFeedbackInputSchema},
  output: {schema: ProvideAdaptiveSkillFeedbackOutputSchema},
  prompt: `You are an AI skill accelerator providing feedback to a student after they complete a training module.

  Module Name: {{{moduleName}}}
  Student Skills: {{#if studentSkills}}{{#each studentSkills}}- {{{this}}}{{/each}}{{else}}None{{/if}}
  Student Weaknesses: {{#if studentWeaknesses}}{{#each studentWeaknesses}}- {{{this}}}{{/each}}{{else}}None{{/if}}
  Student Performance: {{{studentPerformance}}}
  {{#if feedbackRequest}}Student Request: {{{feedbackRequest}}}{{/if}}

  Provide constructive and actionable feedback to the student, focusing on their strengths and weaknesses, and suggesting areas for improvement.  Tailor the feedback to the student's performance and any specific requests they made. Be encouraging, and limit the response to under 200 words.
  `,
});

const provideAdaptiveSkillFeedbackFlow = ai.defineFlow(
  {
    name: 'provideAdaptiveSkillFeedbackFlow',
    inputSchema: ProvideAdaptiveSkillFeedbackInputSchema,
    outputSchema: ProvideAdaptiveSkillFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
