"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createPersonalizedStudyPlan,
  type CreatePersonalizedStudyPlanOutput,
} from "@/ai/flows/create-personalized-study-plan";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, AlertTriangle, Target, Calendar, Clock, Rocket } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const strategistSchema = z.object({
  syllabus: z.string().min(10, "Please enter the syllabus content."),
  timeframeNumber: z.string().min(1, "Please select a number."),
  timeframeUnit: z.enum(["days", "weeks", "months"]),
  learningPace: z.enum(["slow", "medium", "fast"]),
  pastExamPapers: z.string().optional(),
});

type StrategistFormValues = z.infer<typeof strategistSchema>;

export function StrategistForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreatePersonalizedStudyPlanOutput | null>(null);
  const [timeframeUnit, setTimeframeUnit] = useState<"days" | "weeks" | "months">("days");
  const { toast } = useToast();

  const form = useForm<StrategistFormValues>({
    resolver: zodResolver(strategistSchema),
    defaultValues: {
      syllabus: "",
      timeframeNumber: "7",
      timeframeUnit: "days",
      learningPace: "medium",
      pastExamPapers: "",
    },
  });

  async function onSubmit(values: StrategistFormValues) {
    setLoading(true);
    setResult(null);

    const timeframe = `${values.timeframeNumber} ${values.timeframeUnit}`;

    try {
      const plan = await createPersonalizedStudyPlan({
        syllabus: values.syllabus,
        timeframe: timeframe,
        learningPace: values.learningPace,
        pastExamPapers: values.pastExamPapers || "",
      });
      setResult(plan);
    } catch (e: any) {
        toast({
            variant: "destructive",
            title: "Error",
            description: e.message || "Failed to generate study plan. Please try again.",
        });
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleUnitChange = (value: "days" | "weeks" | "months") => {
    setTimeframeUnit(value);
    form.setValue("timeframeUnit", value);
    // Reset number when unit changes
    const defaultNumber = value === "days" ? "7" : value === "weeks" ? "2" : "1";
    form.setValue("timeframeNumber", defaultNumber);
  };

  return (
    <div className="space-y-8">
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input Form */}
        <Card className="lg:col-span-3 border shadow-sm">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="syllabus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        Syllabus Content
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste the full syllabus here..."
                          className="h-36 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid md:grid-cols-2 gap-5">
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      Timeframe
                    </FormLabel>
                    <div className="flex gap-2">
                      <FormField
                        control={form.control}
                        name="timeframeNumber"
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeframeUnit === "days" 
                                ? Array.from({ length: 31 }, (_, i) => i + 1).map((num) => (
                                    <SelectItem key={num} value={String(num)}>
                                      {num}
                                    </SelectItem>
                                  ))
                                : timeframeUnit === "weeks"
                                  ? Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                                      <SelectItem key={num} value={String(num)}>
                                        {num}
                                      </SelectItem>
                                    ))
                                  : Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                                      <SelectItem key={num} value={String(num)}>
                                        {num}
                                      </SelectItem>
                                    ))
                              }
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="timeframeUnit"
                        render={({ field }) => (
                          <Select
                            onValueChange={(value: "days" | "weeks" | "months") => handleUnitChange(value)}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-28">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="days">Days</SelectItem>
                              <SelectItem value="weeks">Weeks</SelectItem>
                              <SelectItem value="months">Months</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                  <FormField
                    control={form.control}
                    name="learningPace"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Rocket className="w-4 h-4 text-muted-foreground" />
                          Learning Pace
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your pace" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="slow">Slow & Steady</SelectItem>
                            <SelectItem value="medium">Average</SelectItem>
                            <SelectItem value="fast">Fast-paced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="pastExamPapers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Past Exam Papers (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Paste content from past exam papers here..."
                          className="h-32 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Study Plan
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="lg:col-span-2 border shadow-sm">
          <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-1.5 rounded bg-secondary">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-semibold">Your Timetable</h3>
              </div>
              
              {loading && (
                  <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <p className="mt-3 text-sm text-muted-foreground">Crafting your plan...</p>
                  </div>
              )}
              
              {result && result.isFeasible && result.studyPlan && result.studyPlan.length > 0 && (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {result.studyPlan.map((item, index) => (
                          <div 
                            key={index} 
                            className="p-3 rounded-lg bg-muted/50 border hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-muted-foreground">{item.day}</span>
                                  <Badge variant={item.priority === 'High' ? 'destructive' : 'secondary'} className="text-xs">
                                      {item.priority}
                                  </Badge>
                                </div>
                                <p className="font-medium text-sm">{item.topic}</p>
                                <p className="text-xs text-muted-foreground mt-1">{item.studyBlocks} • {item.maxTimeToCover}</p>
                              </div>
                            </div>
                          </div>
                      ))}
                  </div>
              )}
              
              {result && !result.isFeasible && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Impossible Timeframe</AlertTitle>
                  <AlertDescription className="text-sm">
                    {result.message || "The timeframe is not realistic. Please provide more time."}
                  </AlertDescription>
                </Alert>
              )}
              
              {!loading && !result && (
                  <div className="text-center py-12 px-4">
                      <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
                        <Target className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <p className="font-medium">Ready to plan?</p>
                      <p className="text-muted-foreground mt-1 text-sm">Fill out the form to generate your study schedule.</p>
                  </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
