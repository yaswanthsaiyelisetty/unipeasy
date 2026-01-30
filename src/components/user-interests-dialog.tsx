"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUserInterests, type UserInterests } from '@/context/user-interests-context';
import { Sparkles, BookOpen, Headphones, Eye, Pencil, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserInterestsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const learningStyles = [
  { value: 'visual', label: 'Visual', icon: Eye, description: 'I learn best with diagrams and images' },
  { value: 'auditory', label: 'Auditory', icon: Headphones, description: 'I learn best by listening' },
  { value: 'reading', label: 'Reading', icon: BookOpen, description: 'I prefer reading text and notes' },
  { value: 'kinesthetic', label: 'Hands-on', icon: Pencil, description: 'I learn by doing and practicing' },
];

const explanationStyles = [
  { value: 'storytelling', label: 'Storytelling', description: 'Explain through engaging stories' },
  { value: 'technical', label: 'Technical', description: 'Precise, detailed explanations' },
  { value: 'analogies', label: 'Analogies', description: 'Connect to real-world examples' },
  { value: 'examples', label: 'Examples', description: 'Learn through practical examples' },
];

const difficultyLevels = [
  { value: 'beginner', label: 'Beginner', description: 'Start from basics' },
  { value: 'intermediate', label: 'Intermediate', description: 'Some prior knowledge' },
  { value: 'advanced', label: 'Advanced', description: 'Deep technical details' },
];

export function UserInterestsDialog({ open, onOpenChange }: UserInterestsDialogProps) {
  const { interests, updateInterests } = useUserInterests();
  const [step, setStep] = useState(1);
  const [localInterests, setLocalInterests] = useState<UserInterests>(interests);
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    setLocalInterests(interests);
  }, [interests]);

  const handleSave = async () => {
    await updateInterests(localInterests);
    onOpenChange(false);
    setStep(1);
  };

  const addInterest = () => {
    if (newInterest.trim() && !localInterests.interests.includes(newInterest.trim())) {
      setLocalInterests(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()],
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setLocalInterests(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest),
    }));
  };

  const totalSteps = 4;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Personalize Your Learning
          </DialogTitle>
          <DialogDescription>
            Tell us about your preferences so we can tailor explanations just for you.
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={cn(
                "h-2 flex-1 rounded-full transition-colors",
                s <= step ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        <div className="min-h-[280px]">
          {/* Step 1: Learning Style */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-medium">How do you learn best?</h3>
              <RadioGroup
                value={localInterests.learningStyle}
                onValueChange={(value) =>
                  setLocalInterests(prev => ({ ...prev, learningStyle: value as UserInterests['learningStyle'] }))
                }
                className="grid grid-cols-2 gap-3"
              >
                {learningStyles.map((style) => (
                  <Label
                    key={style.value}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 border rounded-lg cursor-pointer transition-all hover:border-primary/50",
                      localInterests.learningStyle === style.value && "border-primary bg-primary/5"
                    )}
                  >
                    <RadioGroupItem value={style.value} className="sr-only" />
                    <style.icon className="h-6 w-6 text-muted-foreground" />
                    <span className="font-medium text-sm">{style.label}</span>
                    <span className="text-xs text-muted-foreground text-center">{style.description}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 2: Explanation Style */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-medium">How should we explain things?</h3>
              <RadioGroup
                value={localInterests.explanationStyle}
                onValueChange={(value) =>
                  setLocalInterests(prev => ({ ...prev, explanationStyle: value as UserInterests['explanationStyle'] }))
                }
                className="space-y-3"
              >
                {explanationStyles.map((style) => (
                  <Label
                    key={style.value}
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50",
                      localInterests.explanationStyle === style.value && "border-primary bg-primary/5"
                    )}
                  >
                    <RadioGroupItem value={style.value} />
                    <div>
                      <span className="font-medium text-sm">{style.label}</span>
                      <p className="text-xs text-muted-foreground">{style.description}</p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Step 3: Difficulty Level */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-medium">What's your knowledge level?</h3>
              <RadioGroup
                value={localInterests.difficultyLevel}
                onValueChange={(value) =>
                  setLocalInterests(prev => ({ ...prev, difficultyLevel: value as UserInterests['difficultyLevel'] }))
                }
                className="space-y-3"
              >
                {difficultyLevels.map((level) => (
                  <Label
                    key={level.value}
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all hover:border-primary/50",
                      localInterests.difficultyLevel === level.value && "border-primary bg-primary/5"
                    )}
                  >
                    <RadioGroupItem value={level.value} />
                    <div>
                      <span className="font-medium text-sm">{level.label}</span>
                      <p className="text-xs text-muted-foreground">{level.description}</p>
                    </div>
                  </Label>
                ))}
              </RadioGroup>

              <div className="space-y-2 pt-2">
                <Label htmlFor="fieldOfStudy" className="text-sm font-medium">
                  Field of Study (optional)
                </Label>
                <Input
                  id="fieldOfStudy"
                  placeholder="e.g., Computer Science, Biology, Economics..."
                  value={localInterests.fieldOfStudy}
                  onChange={(e) =>
                    setLocalInterests(prev => ({ ...prev, fieldOfStudy: e.target.value }))
                  }
                />
              </div>
            </div>
          )}

          {/* Step 4: Interests/Topics */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-medium">What topics interest you?</h3>
              <p className="text-sm text-muted-foreground">Add topics you're curious about for personalized examples.</p>
              
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Space, AI, History..."
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addInterest();
                    }
                  }}
                />
                <Button onClick={addInterest} variant="secondary">
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border rounded-lg bg-muted/30">
                {localInterests.interests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No interests added yet</p>
                ) : (
                  localInterests.interests.map((interest) => (
                    <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                      {interest}
                      <button
                        onClick={() => removeInterest(interest)}
                        className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            disabled={step === 1}
          >
            Back
          </Button>
          
          {step < totalSteps ? (
            <Button onClick={() => setStep(prev => prev + 1)}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSave}>
              <Sparkles className="h-4 w-4 mr-2" />
              Save Preferences
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
