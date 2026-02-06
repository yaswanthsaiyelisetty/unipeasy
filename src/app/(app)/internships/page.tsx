"use client";

import { useState, useEffect, useMemo } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InternshipCard } from "@/components/internships/internship-card";
import { SuggestInternshipModal } from "@/components/internships/suggest-internship-modal";
import {
    Internship,
    InternshipCategory,
    categoryLabels,
    isDeadlinePassed
} from "@/lib/internships-data";
import {
    Briefcase,
    Filter,
    Shield,
    Loader2,
    TrendingUp,
    Clock,
    Lightbulb,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { staggerContainer, fadeUpVariant } from "@/lib/animations";

type FilterCategory = InternshipCategory | "all";

export default function InternshipsPage() {
    const [internships, setInternships] = useState<Internship[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
    const [mounted, setMounted] = useState(false);
    const [suggestModalOpen, setSuggestModalOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchInternships();
    }, []);

    const fetchInternships = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "internships"));
            const list: Internship[] = [];
            querySnapshot.forEach((docSnap) => {
                list.push({
                    id: docSnap.id,
                    ...docSnap.data(),
                } as Internship);
            });
            // Sort by createdAt (newest first)
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setInternships(list);
        } catch (error) {
            console.error("Error fetching internships:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredInternships = useMemo(() => {
        if (selectedCategory === "all") return internships;
        return internships.filter((i) => i.category === selectedCategory);
    }, [internships, selectedCategory]);

    const activeInternships = useMemo(() =>
        internships.filter((i) => !isDeadlinePassed(i.deadline)),
        [internships]
    );

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: internships.length };
        internships.forEach((i) => {
            counts[i.category] = (counts[i.category] || 0) + 1;
        });
        return counts;
    }, [internships]);

    return (
        <div className={cn(
            "space-y-4 sm:space-y-6 md:space-y-8 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageHeader
                    title="Internships"
                    description="Verified internship opportunities curated for your success."
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col-reverse sm:flex-row items-start sm:items-center gap-3"
                >
                    <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30">
                        <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 font-medium flex items-center gap-2">
                            <span className="text-base">🤝</span>
                            <span>Help your fellow students discover great opportunities!<br className="hidden sm:block" /> Your suggestion could be someone&apos;s big break.</span>
                        </p>
                    </div>
                    <Button
                        onClick={() => setSuggestModalOpen(true)}
                        className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 gap-2 group shrink-0"
                    >
                        <Lightbulb className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        Suggest an Internship
                        <Sparkles className="h-3 w-3 opacity-70" />
                    </Button>
                </motion.div>
            </div>

            {/* Suggest Internship Modal */}
            <SuggestInternshipModal
                open={suggestModalOpen}
                onOpenChange={setSuggestModalOpen}
            />

            {/* Trust Banner */}
            <Card className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border-emerald-500/20">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/30">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                                Safety First
                                <Badge className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-0 text-xs">
                                    All Verified
                                </Badge>
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Every internship listed here has been manually verified by the UniPeasy team.
                                We cross-check company details, application links, and legitimacy to protect you from fake listings.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
                    <CardContent className="p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/20">
                            <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-lg sm:text-2xl font-bold">{internships.length}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Total</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
                    <CardContent className="p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-green-500/20">
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-lg sm:text-2xl font-bold">{activeInternships.length}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Active</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 col-span-2 md:col-span-1">
                    <CardContent className="p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-purple-500/20">
                            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-lg sm:text-2xl font-bold">
                                {internships.filter((i) => i.deadline && !isDeadlinePassed(i.deadline)).length}
                            </p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">With Deadline</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Category Filter */}
            <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Filter by Category</span>
                </div>
                <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as FilterCategory)}>
                    <TabsList className="flex flex-wrap h-auto gap-1.5 sm:gap-2 bg-transparent p-0">
                        <TabsTrigger
                            value="all"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-2.5 sm:px-4 text-xs sm:text-sm h-7 sm:h-9"
                        >
                            All ({categoryCounts.all || 0})
                        </TabsTrigger>
                        {(Object.keys(categoryLabels) as InternshipCategory[]).map((cat) => (
                            categoryCounts[cat] > 0 && (
                                <TabsTrigger
                                    key={cat}
                                    value={cat}
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-2.5 sm:px-4 text-xs sm:text-sm h-7 sm:h-9"
                                >
                                    {categoryLabels[cat]} ({categoryCounts[cat] || 0})
                                </TabsTrigger>
                            )
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Internship Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Loading internships...</span>
                </div>
            ) : filteredInternships.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 border border-dashed rounded-lg"
                >
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No internships found</h3>
                    <p className="text-muted-foreground mt-1">
                        {selectedCategory !== "all"
                            ? "Try selecting a different category"
                            : "Check back soon for new opportunities!"}
                    </p>
                </motion.div>
            ) : (
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                >
                    {filteredInternships.map((internship, index) => (
                        <InternshipCard
                            key={internship.id}
                            internship={internship}
                            index={index}
                        />
                    ))}
                </motion.div>
            )}
        </div>
    );
}
