"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Internship,
    categoryLabels,
    categoryColors,
    formatDeadline,
    isDeadlineApproaching,
    isDeadlinePassed
} from "@/lib/internships-data";
import {
    ExternalLink,
    MapPin,
    Banknote,
    Calendar,
    CheckCircle2,
    Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { hoverGlow, tapEffect } from "@/lib/animations";

interface InternshipCardProps {
    internship: Internship;
    index?: number;
}

export function InternshipCard({ internship, index = 0 }: InternshipCardProps) {
    const deadlinePassed = isDeadlinePassed(internship.deadline);
    const deadlineApproaching = isDeadlineApproaching(internship.deadline);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={hoverGlow}
            whileTap={tapEffect}
        >
            <Card className={cn(
                "group flex flex-col h-full border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden relative",
                deadlinePassed && "opacity-60"
            )}>
                {/* Verified Badge - Top Right, Most Prominent */}
                <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0 shadow-lg shadow-emerald-500/30 px-3 py-1 gap-1.5 font-semibold animate-pulse">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Verified
                    </Badge>
                </div>

                <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3 pr-24">
                    {/* Category Badge */}
                    <div className="flex gap-2 flex-wrap mb-2">
                        <Badge className={cn("border text-xs", categoryColors[internship.category])}>
                            {categoryLabels[internship.category]}
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

                    <CardTitle className="text-base sm:text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {internship.name}
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-4 sm:p-5 pt-0 flex-grow">
                    {/* Meta info */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                        {internship.location && (
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {internship.location}
                            </span>
                        )}
                        {internship.stipend && (
                            <span className="flex items-center gap-1">
                                <Banknote className="h-3 w-3" />
                                {internship.stipend}
                            </span>
                        )}
                        {internship.deadline && (
                            <span className={cn(
                                "flex items-center gap-1",
                                deadlineApproaching && !deadlinePassed && "text-orange-600 dark:text-orange-400 font-medium",
                                deadlinePassed && "text-red-500 line-through"
                            )}>
                                <Calendar className="h-3 w-3" />
                                {formatDeadline(internship.deadline)}
                            </span>
                        )}
                    </div>

                    {/* Details - Markdown rendered, truncated */}
                    <div className="prose prose-sm dark:prose-invert max-w-none line-clamp-4 text-muted-foreground text-xs sm:text-sm">
                        <ReactMarkdown
                            components={{
                                // Simplify markdown rendering for card preview
                                h1: ({ children }) => <strong>{children}</strong>,
                                h2: ({ children }) => <strong>{children}</strong>,
                                h3: ({ children }) => <strong>{children}</strong>,
                                p: ({ children }) => <p className="mb-1">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc list-inside mb-1">{children}</ul>,
                                li: ({ children }) => <li className="text-xs">{children}</li>,
                            }}
                        >
                            {internship.details.slice(0, 300)}
                        </ReactMarkdown>
                    </div>
                </CardContent>

                <CardFooter className="p-4 sm:p-5 pt-0">
                    <Button
                        asChild
                        className={cn(
                            "w-full h-9 text-sm gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors",
                            deadlinePassed ? "opacity-50 cursor-not-allowed" : ""
                        )}
                        variant={deadlinePassed ? "outline" : "default"}
                        disabled={deadlinePassed}
                    >
                        <a
                            href={internship.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => deadlinePassed && e.preventDefault()}
                        >
                            {deadlinePassed ? "Applications Closed" : "Apply Now"}
                            {!deadlinePassed && <ExternalLink className="h-3.5 w-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                        </a>
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
