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
import { HackathonCard } from "@/components/hackathons/hackathon-card";
import { SuggestHackathonModal } from "@/components/hackathons/suggest-hackathon-modal";
import {
    Hackathon,
    HackathonCategory,
    categoryLabels,
    isDeadlinePassed
} from "@/lib/hackathons-data";
import {
    Trophy,
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

type FilterCategory = HackathonCategory | "all";

export default function HackathonsPage() {
    const [hackathons, setHackathons] = useState<Hackathon[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
    const [mounted, setMounted] = useState(false);
    const [suggestModalOpen, setSuggestModalOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchHackathons();
    }, []);

    const fetchHackathons = async () => {
        try {
            setLoading(true);
            const querySnapshot = await getDocs(collection(db, "hackathons"));
            const list: Hackathon[] = [];
            querySnapshot.forEach((docSnap) => {
                list.push({
                    id: docSnap.id,
                    ...docSnap.data(),
                } as Hackathon);
            });
            // Sort by createdAt (newest first)
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setHackathons(list);
        } catch (error) {
            console.error("Error fetching hackathons:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredHackathons = useMemo(() => {
        if (selectedCategory === "all") return hackathons;
        return hackathons.filter((h) => h.category === selectedCategory);
    }, [hackathons, selectedCategory]);

    const activeHackathons = useMemo(() =>
        hackathons.filter((h) => !isDeadlinePassed(h.deadline)),
        [hackathons]
    );

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = { all: hackathons.length };
        hackathons.forEach((h) => {
            counts[h.category] = (counts[h.category] || 0) + 1;
        });
        return counts;
    }, [hackathons]);

    return (
        <div className={cn(
            "space-y-4 sm:space-y-6 md:space-y-8 transition-all duration-500",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageHeader
                    title="Hackathons"
                    description="Verified hackathon opportunities curated for your success."
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col-reverse sm:flex-row items-start sm:items-center gap-3"
                >
                    <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-violet-500/15 to-purple-500/15 border border-violet-500/30">
                        <p className="text-xs sm:text-sm text-violet-700 dark:text-violet-400 font-medium flex items-center gap-2">
                            <span className="text-base">🏆</span>
                            <span>Know a great hackathon? Share it with the community!<br className="hidden sm:block" /> Your suggestion could help someone win big.</span>
                        </p>
                    </div>
                    <Button
                        onClick={() => setSuggestModalOpen(true)}
                        className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white shadow-lg shadow-violet-500/25 gap-2 group shrink-0"
                    >
                        <Lightbulb className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                        Suggest a Hackathon
                        <Sparkles className="h-3 w-3 opacity-70" />
                    </Button>
                </motion.div>
            </div>

            {/* Suggest Hackathon Modal */}
            <SuggestHackathonModal
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
                                Every hackathon listed here has been manually verified by the UniPeasy team.
                                We cross-check organizer details, registration links, and legitimacy to protect you from fake events.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
                    <CardContent className="p-2.5 sm:p-4 flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-lg bg-violet-500/20">
                            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-violet-500" />
                        </div>
                        <div>
                            <p className="text-lg sm:text-2xl font-bold">{hackathons.length}</p>
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
                            <p className="text-lg sm:text-2xl font-bold">{activeHackathons.length}</p>
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
                                {hackathons.filter((h) => h.deadline && !isDeadlinePassed(h.deadline)).length}
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
                        {(Object.keys(categoryLabels) as HackathonCategory[]).map((cat) => (
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

            {/* Hackathon Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Loading hackathons...</span>
                </div>
            ) : filteredHackathons.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-16 border border-dashed rounded-lg"
                >
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No hackathons found</h3>
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
                    {filteredHackathons.map((hackathon, index) => (
                        <HackathonCard
                            key={hackathon.id}
                            hackathon={hackathon}
                            index={index}
                        />
                    ))}
                </motion.div>
            )}
        </div>
    );
}
