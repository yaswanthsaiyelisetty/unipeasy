"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
    Lightbulb,
    Send,
    Loader2,
    CheckCircle2,
    Link2,
    FileText,
    Sparkles,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestInternshipModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SuggestInternshipModal({ open, onOpenChange }: SuggestInternshipModalProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        link: "",
        description: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Internship name is required";
        } else if (formData.name.trim().length < 3) {
            newErrors.name = "Name must be at least 3 characters";
        }

        if (!formData.link.trim()) {
            newErrors.link = "Application link is required";
        } else {
            try {
                new URL(formData.link);
            } catch {
                newErrors.link = "Please enter a valid URL";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "internship_suggestions"), {
                name: formData.name.trim(),
                link: formData.link.trim(),
                description: formData.description.trim() || null,
                submittedBy: user?.email || "anonymous",
                submittedByUid: user?.uid || null,
                submittedByName: user?.displayName || "Anonymous",
                status: "pending", // pending, approved, rejected
                createdAt: serverTimestamp(),
            });

            setSubmitted(true);
            toast({
                title: "Suggestion Submitted! 🎉",
                description: "Thank you for helping fellow students find opportunities!",
            });

            // Reset form after a brief moment
            setTimeout(() => {
                setFormData({ name: "", link: "", description: "" });
                setSubmitted(false);
                onOpenChange(false);
            }, 2000);
        } catch (error) {
            console.error("Error submitting suggestion:", error);
            toast({
                title: "Submission Failed",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({ name: "", link: "", description: "" });
            setErrors({});
            setSubmitted(false);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg overflow-hidden p-0">
                <AnimatePresence mode="wait">
                    {submitted ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center py-12 px-6"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30"
                            >
                                <CheckCircle2 className="h-10 w-10 text-white" />
                            </motion.div>
                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl font-bold text-foreground mb-2"
                            >
                                Thank You! 🎉
                            </motion.h3>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-muted-foreground text-center"
                            >
                                Your suggestion has been submitted for review.
                                <br />
                                We'll verify and add it soon!
                            </motion.p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Header with gradient background */}
                            <div className="relative bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 px-6 pt-6 pb-4 border-b">
                                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                                <DialogHeader className="relative">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
                                            <Lightbulb className="h-5 w-5 text-white" />
                                        </div>
                                        <DialogTitle className="text-xl">Suggest an Internship</DialogTitle>
                                    </div>
                                    <DialogDescription className="text-sm">
                                        Found an internship opportunity? Share it with fellow students!
                                        Our team will verify and add it to the list.
                                    </DialogDescription>
                                </DialogHeader>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Internship Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                                        <Sparkles className="h-4 w-4 text-amber-500" />
                                        Internship Name
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., Google STEP Internship, Microsoft SWE Intern"
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, name: e.target.value });
                                            if (errors.name) setErrors({ ...errors, name: "" });
                                        }}
                                        className={cn(
                                            "transition-all duration-200",
                                            errors.name && "border-red-500 focus-visible:ring-red-500"
                                        )}
                                        disabled={isSubmitting}
                                    />
                                    {errors.name && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-xs text-red-500 flex items-center gap-1"
                                        >
                                            <X className="h-3 w-3" />
                                            {errors.name}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Application Link */}
                                <div className="space-y-2">
                                    <Label htmlFor="link" className="flex items-center gap-2 text-sm font-medium">
                                        <Link2 className="h-4 w-4 text-blue-500" />
                                        Application Link
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="link"
                                        type="url"
                                        placeholder="https://careers.company.com/internship"
                                        value={formData.link}
                                        onChange={(e) => {
                                            setFormData({ ...formData, link: e.target.value });
                                            if (errors.link) setErrors({ ...errors, link: "" });
                                        }}
                                        className={cn(
                                            "transition-all duration-200",
                                            errors.link && "border-red-500 focus-visible:ring-red-500"
                                        )}
                                        disabled={isSubmitting}
                                    />
                                    {errors.link && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-xs text-red-500 flex items-center gap-1"
                                        >
                                            <X className="h-3 w-3" />
                                            {errors.link}
                                        </motion.p>
                                    )}
                                </div>

                                {/* Description (Optional) */}
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
                                        <FileText className="h-4 w-4 text-purple-500" />
                                        Description
                                        <span className="text-muted-foreground text-xs">(Optional)</span>
                                    </Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Brief description, eligibility criteria, or any helpful info..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="min-h-[80px] resize-none transition-all duration-200"
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Any additional details that might help other students
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClose}
                                        disabled={isSubmitting}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 gap-2"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4" />
                                                Submit Suggestion
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Info note */}
                                <p className="text-xs text-center text-muted-foreground">
                                    All submissions are reviewed by our team before being published
                                </p>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
