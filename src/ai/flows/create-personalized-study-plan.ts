'use server';

/**
 * @fileOverview This file defines a Genkit flow for creating a personalized study plan.
 *
 * The flow takes syllabus, timeframe, learning pace, and past exam papers as input
 * and generates a prioritized timetable with clear study and break intervals to maximize the student's exam score.
 *
 * @exports createPersonalizedStudyPlan - An async function that calls the flow.
 * @exports CreatePersonalizedStudyPlanInput - The input type for the createPersonalizedStudyPlan function.
 * @exports CreatePersonalizedStudyPlanOutput - The return type for the createPersonalizedStudyPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreatePersonalizedStudyPlanInputSchema = z.object({
  syllabus: z.string().describe('The syllabus for the exam.'),
  timeframe: z.string().describe('The amount of time available for studying (e.g., "2 weeks").'),
  learningPace: z.string().describe('The student\'s learning pace (e.g., "slow", "medium", "fast").'),
  pastExamPapers: z.string().describe('Past exam papers, including questions and answers.'),
});
export type CreatePersonalizedStudyPlanInput = z.infer<typeof CreatePersonalizedStudyPlanInputSchema>;

const StudyPlanItemSchema = z.object({
  day: z.string().describe('Day of the study plan (e.g., "Day 1", "Week 1 - Monday").'),
  topic: z.string().describe('The topic to study.'),
  studyBlocks: z.string().describe('A clear description of study and break periods (e.g., "2 study blocks of 25 mins with a 5 min break").'),
  priority: z.string().describe('Priority of the topic (e.g., "High", "Medium", "Low").'),
  maxTimeToCover: z.string().describe('The maximum time to spend on this topic, in a human-readable format (e.g., "4 hours", "90 minutes").'),
});

const CreatePersonalizedStudyPlanOutputSchema = z.object({
  isFeasible: z.boolean().describe('Whether the study plan is feasible within the given timeframe.'),
  message: z.string().optional().describe('A message explaining why the plan is not feasible, if applicable.'),
  studyPlan: z.array(StudyPlanItemSchema).optional().describe('A prioritized timetable for studying, structured as a list of items.'),
});
export type CreatePersonalizedStudyPlanOutput = z.infer<typeof CreatePersonalizedStudyPlanOutputSchema>;

export async function createPersonalizedStudyPlan(input: CreatePersonalizedStudyPlanInput): Promise<CreatePersonalizedStudyPlanOutput> {
  return createPersonalizedStudyPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createPersonalizedStudyPlanPrompt',
  input: {schema: CreatePersonalizedStudyPlanInputSchema},
  output: {schema: CreatePersonalizedStudyPlanOutputSchema},
  prompt: `You are an AI Exam Strategist. Your first task is to evaluate if the provided syllabus can be realistically covered in the given timeframe.

Syllabus: {{{syllabus}}}
Timeframe: {{{timeframe}}}
Learning Pace: {{{learningPace}}}
{{#if pastExamPapers}}Past Exam Papers: {{{pastExamPapers}}}{{/if}}

1. **Feasibility Check**: Based on the volume of the syllabus and the learning pace, determine if the timeframe is realistic.
   - If the timeframe is clearly impossible (e.g., a 3-month course in 2 days), set 'isFeasible' to false and provide a brief 'message' explaining why (e.g., "The provided timeframe is too short to cover the extensive syllabus."). Do not generate a study plan.
   - If the timeframe is challenging but possible, or easily achievable, set 'isFeasible' to true.

2. **Study Plan Generation**: If 'isFeasible' is true, create a prioritized timetable to maximize the student's exam score. Instead of "Pomodoro sessions," clearly define study and break periods (e.g., "2 study blocks of 25 mins with a 5 min break").

For each item in the plan, provide:
- The day.
- The topic.
- The study blocks and breaks.
- The priority (High, Medium, Low).
- The maximum total time to cover the topic.
`,
});

const createPersonalizedStudyPlanFlow = ai.defineFlow(
  {
    name: 'createPersonalizedStudyPlanFlow',
    inputSchema: CreatePersonalizedStudyPlanInputSchema,
    outputSchema: CreatePersonalizedStudyPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
