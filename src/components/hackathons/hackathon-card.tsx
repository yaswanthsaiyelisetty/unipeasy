"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Hackathon,
    categoryLabels,
    categoryColors,
    formatDeadline,
    isDeadlineApproaching,
    isDeadlinePassed
} from "@/lib/hackathons-data";
import {
    ExternalLink,
    MapPin,
    Trophy,
    Calendar,
    CheckCircle2,
    Clock,
    ChevronRight,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hoverGlow, tapEffect } from "@/lib/animations";

interface HackathonCardProps {
    hackathon: Hackathon;
    index?: number;
}

export function HackathonCard({ hackathon, index = 0 }: HackathonCardProps) {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const deadlinePassed = isDeadlinePassed(hackathon.deadline);
    const deadlineApproaching = isDeadlineApproaching(hackathon.deadline);

    // Get first 100 chars of plain text for preview
    const previewText = hackathon.details
        .replace(/[#*_`\[\]]/g, '')
        .replace(/\n+/g, ' ')
        .trim()
        .slice(0, 100);

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={hoverGlow}
                whileTap={tapEffect}
                onClick={() => setDetailsOpen(true)}
                className="cursor-pointer"
            >
                <Card className={cn(
                    "group flex flex-col h-full border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden relative",
                    deadlinePassed && "opacity-60"
                )}>
                    {/* Verified Badge - Top Right */}
                    <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0 shadow-lg shadow-emerald-500/30 px-2 py-0.5 gap-1 text-xs font-medium">
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                        </Badge>
                    </div>

                    <CardHeader className="p-4 pb-2 pr-20">
                        {/* Category Badge */}
                        <div className="flex gap-2 flex-wrap mb-2">
                            <Badge className={cn("border text-xs", categoryColors[hackathon.category])}>
                                {categoryLabels[hackathon.category]}
                            </Badge>
                            {deadlineApproaching && !deadlinePassed && (
                                <Badge variant="outline" className="text-xs border-orange-500/50 text-orange-600 dark:text-orange-400 bg-orange-500/10">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Closing Soon
                                </Badge>
                            )}
                            {deadlinePassed && (
                                <Badge variant="outline" className="text-xs border-red-500/50 text-red-600 dark:text-red-400 bg-red-500/10">
                                    Closed
                                </Badge>
                            )}
                        </div>

                        <CardTitle className="text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                            {hackathon.name}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 pt-0 flex-grow">
                        {/* Meta info */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                            {hackathon.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {hackathon.location}
                                </span>
                            )}
                            {hackathon.prizePool && (
                                <span className="flex items-center gap-1">
                                    <Trophy className="h-3 w-3" />
                                    {hackathon.prizePool}
                                </span>
                            )}
                            {hackathon.teamSize && (
                                <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {hackathon.teamSize}
                                </span>
                            )}
                            {hackathon.deadline && (
                                <span className={cn(
                                    "flex items-center gap-1",
                                    deadlineApproaching && !deadlinePassed && "text-orange-600 dark:text-orange-400 font-medium",
                                    deadlinePassed && "text-red-500 line-through"
                                )}>
                                    <Calendar className="h-3 w-3" />
                                    {formatDeadline(hackathon.deadline)}
                                </span>
                            )}
                        </div>

                        {/* Brief preview */}
                        <p className="text-xs text-muted-foreground line-clamp-2">
                            {previewText}{previewText.length >= 100 && "..."}
                        </p>
                    </CardContent>

                    <CardFooter className="p-4 pt-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full h-8 text-xs gap-1 text-muted-foreground hover:text-primary"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDetailsOpen(true);
                            }}
                        >
                            View Details
                            <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>

            {/* Details Modal */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
                    <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-r from-primary/5 to-purple-500/5">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 shrink-0">
                                <Trophy className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex gap-2 flex-wrap mb-2">
                                    <Badge className={cn("border text-xs", categoryColors[hackathon.category])}>
                                        {categoryLabels[hackathon.category]}
                                    </Badge>
                                    <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0 text-xs gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Verified
                                    </Badge>
                                    {deadlineApproaching && !deadlinePassed && (
                                        <Badge variant="outline" className="text-xs border-orange-500/50 text-orange-600 dark:text-orange-400 bg-orange-500/10">
                                            <Clock className="h-3 w-3 mr-1" />
                                            Closing Soon
                                        </Badge>
                                    )}
                                    {deadlinePassed && (
                                        <Badge variant="outline" className="text-xs border-red-500/50 text-red-600 dark:text-red-400 bg-red-500/10">
                                            Closed
                                        </Badge>
                                    )}
                                </div>
                                <DialogTitle className="text-xl font-bold text-foreground">
                                    {hackathon.name}
                                </DialogTitle>
                            </div>
                        </div>
                    </DialogHeader>

                    <ScrollArea className="max-h-[60vh]">
                        <div className="p-6 space-y-6">
                            {/* Quick Info */}
                            <div className="flex flex-wrap gap-4 p-4 rounded-lg bg-muted/50">
                                {hackathon.location && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{hackathon.location}</span>
                                    </div>
                                )}
                                {hackathon.prizePool && (
                                    <div className="flex items-center gap-2">
                                        <Trophy className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{hackathon.prizePool}</span>
                                    </div>
                                )}
                                {hackathon.teamSize && (
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{hackathon.teamSize}</span>
                                    </div>
                                )}
                                {hackathon.deadline && (
                                    <div className={cn(
                                        "flex items-center gap-2",
                                        deadlineApproaching && !deadlinePassed && "text-orange-600 dark:text-orange-400",
                                        deadlinePassed && "text-red-500"
                                    )}>
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            Deadline: {formatDeadline(hackathon.deadline)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Full Details */}
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ children }) => <h1 className="text-lg font-bold text-foreground mt-4 mb-2">{children}</h1>,
                                        h2: ({ children }) => <h2 className="text-base font-semibold text-foreground mt-4 mb-2">{children}</h2>,
                                        h3: ({ children }) => <h3 className="text-sm font-semibold text-foreground mt-3 mb-1">{children}</h3>,
                                        p: ({ children }) => <p className="mb-3 text-muted-foreground leading-relaxed">{children}</p>,
                                        ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-muted-foreground">{children}</ul>,
                                        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-muted-foreground">{children}</ol>,
                                        li: ({ children }) => <li className="text-sm">{children}</li>,
                                        strong: ({ children }) => <strong className="text-foreground font-semibold">{children}</strong>,
                                        em: ({ children }) => <em className="italic">{children}</em>,
                                        a: ({ href, children }) => (
                                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                {children}
                                            </a>
                                        ),
                                    }}
                                >
                                    {hackathon.details}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Footer with Register Button */}
                    <div className="p-6 pt-4 border-t bg-muted/30">
                        <Button
                            asChild
                            className={cn(
                                "w-full h-11 text-sm gap-2 font-medium",
                                deadlinePassed ? "opacity-50 cursor-not-allowed" : ""
                            )}
                            variant={deadlinePassed ? "outline" : "default"}
                            disabled={deadlinePassed}
                        >
                            <a
                                href={hackathon.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => deadlinePassed && e.preventDefault()}
                            >
                                {deadlinePassed ? "Registrations Closed" : "Register Now"}
                                {!deadlinePassed && <ExternalLink className="h-4 w-4" />}
                            </a>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
