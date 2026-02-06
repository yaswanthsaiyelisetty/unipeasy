"use client";

import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Gift, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { branches, years } from "@/lib/materials-data";

interface ContributeDialogProps {
    branch?: string;
    year?: string;
}

export function ContributeDialog({ branch, year }: ContributeDialogProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [contributorName, setContributorName] = useState("");
    const [subjectName, setSubjectName] = useState("");
    const [selectedBranch, setSelectedBranch] = useState(branch || "");
    const [selectedYear, setSelectedYear] = useState(year || "");
    const [mobileNumber, setMobileNumber] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!contributorName.trim()) {
            toast({
                title: "Name Required",
                description: "Please enter your name.",
                variant: "destructive",
            });
            return;
        }

        if (!subjectName.trim()) {
            toast({
                title: "Subject Required",
                description: "Please enter the subject name you want to contribute.",
                variant: "destructive",
            });
            return;
        }

        if (!selectedBranch) {
            toast({
                title: "Branch Required",
                description: "Please select the branch for this subject.",
                variant: "destructive",
            });
            return;
        }

        if (!selectedYear) {
            toast({
                title: "Year Required",
                description: "Please select the year for this subject.",
                variant: "destructive",
            });
            return;
        }

        if (!mobileNumber.trim() || mobileNumber.length < 10) {
            toast({
                title: "Valid Mobile Number Required",
                description: "Please enter a valid 10-digit mobile number.",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);
        try {
            await addDoc(collection(db, "material_contributions"), {
                contributorName: contributorName.trim(),
                subjectName: subjectName.trim(),
                mobileNumber: mobileNumber.trim(),
                branch: selectedBranch,
                year: selectedYear,
                submittedBy: user?.email || "Anonymous",
                submittedByName: user?.displayName || contributorName.trim(),
                submittedByUid: user?.uid || null,
                status: "pending",
                createdAt: Timestamp.now(),
            });

            setSubmitted(true);
            toast({
                title: "Thank You! 🎉",
                description: "We'll contact you soon about your contribution.",
            });

            // Reset after delay
            setTimeout(() => {
                setOpen(false);
                setSubmitted(false);
                setContributorName("");
                setSubjectName("");
                setSelectedBranch(branch || "");
                setSelectedYear(year || "");
                setMobileNumber("");
            }, 2000);
        } catch (error) {
            console.error("Error submitting contribution:", error);
            toast({
                title: "Submission Failed",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    <Gift className="h-4 w-4" />
                    I Want to Contribute
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                {submitted ? (
                    <div className="py-8 text-center">
                        <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                            Submitted Successfully!
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">
                            Our team will reach out to you shortly.
                        </p>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Gift className="h-5 w-5 text-emerald-500" />
                                Contribute Study Materials
                            </DialogTitle>
                            <DialogDescription>
                                Share your notes and get rewarded! Fill in the details and we'll contact you.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Your Name *</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter your full name"
                                    value={contributorName}
                                    onChange={(e) => setContributorName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject Name *</Label>
                                <Input
                                    id="subject"
                                    placeholder="e.g., Data Structures, Digital Electronics"
                                    value={subjectName}
                                    onChange={(e) => setSubjectName(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label>Branch *</Label>
                                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches.map((b) => (
                                                <SelectItem key={b.id} value={b.id}>
                                                    {b.shortName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Year *</Label>
                                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {years.map((y) => (
                                                <SelectItem key={y.id} value={y.id}>
                                                    {y.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mobile">Mobile Number *</Label>
                                <Input
                                    id="mobile"
                                    type="tel"
                                    placeholder="Enter your 10-digit mobile number"
                                    value={mobileNumber}
                                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                    maxLength={10}
                                />
                                <p className="text-xs text-muted-foreground">
                                    We'll contact you on WhatsApp or call.
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-emerald-600 hover:bg-emerald-700"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit"
                                )}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
