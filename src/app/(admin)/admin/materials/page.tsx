"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Save, Loader2, BookOpen, ArrowLeft, Link as LinkIcon, GripVertical } from "lucide-react";
import { branches, years } from "@/lib/materials-data";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

interface UnitInput {
  unit_number: number;
  unit_title: string;
  drive_link: string;
}

export default function AdminMaterialsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [subjectId, setSubjectId] = useState("");
  const [subjectTitle, setSubjectTitle] = useState("");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [units, setUnits] = useState<UnitInput[]>([
    { unit_number: 1, unit_title: "", drive_link: "" }
  ]);

  const addUnit = () => {
    setUnits([...units, { 
      unit_number: units.length + 1, 
      unit_title: "", 
      drive_link: "" 
    }]);
  };

  const removeUnit = (index: number) => {
    const newUnits = units.filter((_, i) => i !== index);
    // Renumber units
    setUnits(newUnits.map((unit, i) => ({ ...unit, unit_number: i + 1 })));
  };

  const updateUnit = (index: number, field: keyof UnitInput, value: string | number) => {
    const newUnits = [...units];
    newUnits[index] = { ...newUnits[index], [field]: value };
    setUnits(newUnits);
  };

  const toggleBranch = (branchId: string) => {
    setSelectedBranches(prev => 
      prev.includes(branchId) 
        ? prev.filter(b => b !== branchId)
        : [...prev, branchId]
    );
  };

  const generateSubjectId = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subjectTitle || selectedBranches.length === 0 || !selectedYear) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate units
    const validUnits = units.filter(u => u.unit_title && u.drive_link);
    if (validUnits.length === 0) {
      toast({
        title: "No units",
        description: "Please add at least one unit with title and drive link",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const docId = subjectId || generateSubjectId(subjectTitle);
      const subjectData = {
        title: subjectTitle,
        branch: selectedBranches.map(b => b.toUpperCase()),
        year: selectedYear,
        units: validUnits,
      };

      await setDoc(doc(db, "subjects", docId), subjectData);

      toast({
        title: "Success!",
        description: `Subject "${subjectTitle}" has been added with ${validUnits.length} units.`,
      });

      // Navigate back to admin dashboard
      router.push("/admin");

    } catch (error: any) {
      console.error("Error adding subject:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to add subject. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Subject</h1>
          <p className="text-muted-foreground mt-1">
            Create a new subject with unit-wise PDF links
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Subject Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Subject Details
            </CardTitle>
            <CardDescription>
              Basic information about the subject
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Subject Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Digital Electronics"
                  value={subjectTitle}
                  onChange={(e) => setSubjectTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="id">Subject ID (auto-generated)</Label>
                <Input
                  id="id"
                  placeholder="Auto-generated from title"
                  value={subjectId || generateSubjectId(subjectTitle)}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Select Year <span className="text-destructive">*</span>
              </Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name} ({year.semester})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Select Branches <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={branch.id}
                      checked={selectedBranches.includes(branch.id)}
                      onCheckedChange={() => toggleBranch(branch.id)}
                    />
                    <label
                      htmlFor={branch.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {branch.shortName}
                    </label>
                  </div>
                ))}
              </div>
              {selectedBranches.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedBranches.map(b => (
                    <Badge key={b} variant="secondary">{b.toUpperCase()}</Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Units */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-emerald-600" />
                  Units ({units.length})
                </CardTitle>
                <CardDescription>
                  Add PDF links for each unit
                </CardDescription>
              </div>
              <Button type="button" variant="outline" onClick={addUnit}>
                <Plus className="h-4 w-4 mr-1" />
                Add Unit
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {units.map((unit, index) => (
              <div key={index} className="p-4 border border-border rounded-lg bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <Badge className="bg-blue-600">Unit {unit.unit_number}</Badge>
                  </div>
                  {units.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUnit(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Unit Title</Label>
                    <Input
                      placeholder="e.g., Boolean Algebra"
                      value={unit.unit_title}
                      onChange={(e) => updateUnit(index, "unit_title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Google Drive Link</Label>
                    <Input
                      placeholder="https://drive.google.com/file/d/..."
                      value={unit.drive_link}
                      onChange={(e) => updateUnit(index, "drive_link", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Link href="/admin">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 min-w-[150px]">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Subject
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Quick Tips */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">💡 Quick Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Upload your PDFs to Google Drive first</li>
            <li>• Right-click → "Get link" → Set to "Anyone with the link"</li>
            <li>• Paste the share link in the Drive Link field</li>
            <li>• One subject can belong to multiple branches</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
