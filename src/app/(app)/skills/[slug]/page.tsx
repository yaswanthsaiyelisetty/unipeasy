"use client";

import { notFound, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { skillsData, type Level, type Tier, type SkillTrack } from '@/lib/skills-data';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Lock, PlayCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SkillTrackPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const trackData = slug ? skillsData[slug] : undefined;
  
  const [journey, setJourney] = useState<Tier[]>(trackData?.journey || []);

  useEffect(() => {
    if (typeof window !== 'undefined' && trackData) {
      const updatedJourney = trackData.journey.map((tier: Tier) => ({
        ...tier,
        levels: tier.levels.map((level: Level) => {
          const isCompleted = localStorage.getItem(`skill-${trackData.slug}-level-${level.level}`) === 'completed';
          return { ...level, isCompleted };
        })
      }));
      setJourney(updatedJourney);
    }
  }, [trackData]);


  if (!trackData) {
    return notFound();
  }
  
  const totalLevels = journey.reduce((sum: number, tier: Tier) => sum + tier.levels.length, 0);
  const completedLevels = journey.reduce((sum: number, tier: Tier) => sum + tier.levels.filter((l: Level) => l.isCompleted).length, 0);
  const progress = totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;
  const currentLevel = completedLevels + 1;

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8">
      <PageHeader title={trackData.title} description={trackData.description} />

      {/* Progress Card */}
      <Card className="border shadow-sm">
        <CardContent className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Your Progress</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold">{Math.round(progress)}%</p>
                  <p className="text-xs text-muted-foreground">({completedLevels}/{totalLevels} levels)</p>
                </div>
              </div>
            </div>
            <div className="w-full">
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div 
                  className="h-full rounded-full bg-foreground transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Journey Accordion */}
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        <h2 className="text-sm sm:text-base md:text-lg font-semibold">Your Journey</h2>
        
        <Accordion type="single" collapsible defaultValue="item-0" className="w-full space-y-2">
          {journey.map((tier: Tier, tierIndex: number) => {
            const isTierUnlocked = tier.levels.some((l: Level) => l.isCompleted || l.level === currentLevel);
            const tierProgress = tier.levels.filter((l: Level) => l.isCompleted).length / tier.levels.length * 100;
            
            return (
              <AccordionItem 
                value={`item-${tierIndex}`} 
                key={tier.tier} 
                disabled={!isTierUnlocked} 
                className={`border rounded-lg overflow-hidden ${isTierUnlocked ? 'shadow-sm' : 'opacity-60'}`}
              >
                <AccordionTrigger className={`px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-4 hover:no-underline ${!isTierUnlocked ? 'cursor-not-allowed' : ''}`}>
                  <div className="flex items-center gap-2 sm:gap-3 w-full">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center text-xs font-semibold shrink-0 ${isTierUnlocked ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                      {tier.tier}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="font-medium text-xs sm:text-sm md:text-base truncate">{tier.title}</span>
                        {tierProgress === 100 && <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-foreground shrink-0" />}
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                        <div className="h-1 w-12 sm:w-16 md:w-20 rounded-full bg-secondary overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-foreground transition-all duration-500"
                            style={{ width: `${tierProgress}%` }}
                          />
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">{tier.levels.filter((l: Level) => l.isCompleted).length}/{tier.levels.length}</span>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4 md:pb-5">
                    <div className="pl-9 sm:pl-10 md:pl-12 space-y-2 sm:space-y-3">
                      <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2">{tier.focus}</p>
                      <p className="text-[10px] sm:text-xs md:text-sm"><span className="font-medium">Goal:</span> {tier.goal}</p>
                      
                      <div className="space-y-1.5 sm:space-y-2">
                          {tier.levels.map((level: Level) => (
                              <div 
                                  key={level.level}
                                  className={`flex items-center gap-2 p-2 sm:p-2.5 md:p-3 rounded-lg border transition-all ${
                                    level.isCompleted 
                                      ? 'bg-muted/50' 
                                      : level.level === currentLevel 
                                        ? 'bg-muted/30' 
                                        : 'opacity-50'
                                  }`}
                              >
                                  <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                    level.isCompleted 
                                      ? 'bg-foreground text-background' 
                                      : level.level === currentLevel 
                                        ? 'bg-secondary' 
                                        : 'bg-muted'
                                  }`}>
                                    {level.isCompleted ? (
                                      <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                                    ) : level.level === currentLevel ? (
                                      <PlayCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                                    ) : (
                                      <Lock className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-muted-foreground" />
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                      <p className="font-medium text-[11px] sm:text-xs md:text-sm truncate">Lvl {level.level}: {level.title}</p>
                                      <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground truncate hidden xs:block">
                                          {level.challengeType} • {level.example}
                                      </p>
                                  </div>
                                  
                                  {level.level <= currentLevel && (
                                      <Button size="sm" variant={level.isCompleted ? "secondary" : "default"} asChild className="shrink-0 h-6 sm:h-7 md:h-8 text-[10px] sm:text-xs px-2 sm:px-2.5 md:px-3">
                                          <Link href={`/skills/${trackData.slug}/${level.level}`}>
                                              {level.isCompleted ? 'Redo' : 'Start'}
                                          </Link>
                                      </Button>
                                  )}
                              </div>
                          ))}
                      </div>
                    </div>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </div>
  );
}
