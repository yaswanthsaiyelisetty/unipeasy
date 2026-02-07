"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { usePlan } from "@/context/plan-context";
import { useTheme } from "next-themes";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  Crown,
  Sparkles,
  Sun,
  Moon,
  LogOut,
  Check,
  Loader2,
  Shield,
  Settings,
  Palette,
  CreditCard,
  ChevronRight,
  Gift,
  CheckCircle2,
  Building,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { triggerSmallConfetti } from "@/lib/confetti";

interface UserProfile {
  displayName: string;
  collegeName: string;
  fieldOfStudy: string;
  currentYear: string;
}

const fieldsOfStudy = [
  "Computer Science & Engineering",
  "Electronics & Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Information Technology",
  "Chemical Engineering",
  "Biotechnology",
  "Other",
];

const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

export default function ProfilePage() {
  const { user } = useAuth();
  const { hasActivePlan, planDetails, setShowClaimModal } = usePlan();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    displayName: "",
    collegeName: "",
    fieldOfStudy: "",
    currentYear: "",
  });

  useEffect(() => {
    setMounted(true);
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const profileRef = doc(db, "userProfiles", user.uid);
      const profileDoc = await getDoc(profileRef);

      if (profileDoc.exists()) {
        const data = profileDoc.data();
        setProfile({
          displayName: data.displayName || user.displayName || "",
          collegeName: data.collegeName || "",
          fieldOfStudy: data.fieldOfStudy || "",
          currentYear: data.currentYear || "",
        });
      } else {
        // Initialize with user's display name from auth
        setProfile({
          displayName: user.displayName || "",
          collegeName: "",
          fieldOfStudy: "",
          currentYear: "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const profileRef = doc(db, "userProfiles", user.uid);
      await setDoc(profileRef, {
        ...profile,
        userId: user.uid,
        email: user.email,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      triggerSmallConfetti();
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline">Profile & Settings</h1>
        <p className="text-muted-foreground">
          Manage your academic profile and preferences
        </p>
      </div>

      {/* Profile Card */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20" />
        <CardHeader className="relative pb-2">
          <div className="absolute -top-12 left-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
              <AvatarImage
                src={
                  user?.photoURL ||
                  `https://picsum.photos/seed/${user?.uid}/96/96`
                }
              />
              <AvatarFallback className="text-2xl">
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="pt-14 sm:pt-0 sm:pl-32 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">
                {profile.displayName || user?.displayName || "Student"}
              </CardTitle>
              <CardDescription className="flex items-center gap-1.5 mt-1">
                <Mail className="h-3.5 w-3.5" />
                {user?.email}
              </CardDescription>
            </div>
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              ) : (
                "Edit Profile"
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Full Name
              </Label>
              {isEditing ? (
                <Input
                  id="displayName"
                  value={profile.displayName}
                  onChange={(e) =>
                    setProfile({ ...profile, displayName: e.target.value })
                  }
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-sm py-2 px-3 rounded-md bg-muted/50">
                  {profile.displayName || "Not set"}
                </p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </Label>
              <div className="text-sm py-2 px-3 rounded-md bg-muted/50 flex items-center">
                {user?.email}
                <Badge variant="secondary" className="ml-2 text-xs">
                  Verified
                </Badge>
              </div>
            </div>

            {/* College Name */}
            <div className="space-y-2">
              <Label htmlFor="collegeName" className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                College / University
              </Label>
              {isEditing ? (
                <Input
                  id="collegeName"
                  value={profile.collegeName}
                  onChange={(e) =>
                    setProfile({ ...profile, collegeName: e.target.value })
                  }
                  placeholder="Enter your college name"
                />
              ) : (
                <p className="text-sm py-2 px-3 rounded-md bg-muted/50">
                  {profile.collegeName || "Not set"}
                </p>
              )}
            </div>

            {/* Field of Study */}
            <div className="space-y-2">
              <Label
                htmlFor="fieldOfStudy"
                className="flex items-center gap-2"
              >
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                Field of Study
              </Label>
              {isEditing ? (
                <Select
                  value={profile.fieldOfStudy}
                  onValueChange={(value) =>
                    setProfile({ ...profile, fieldOfStudy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your field" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldsOfStudy.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm py-2 px-3 rounded-md bg-muted/50">
                  {profile.fieldOfStudy || "Not set"}
                </p>
              )}
            </div>

            {/* Current Year */}
            <div className="space-y-2">
              <Label htmlFor="currentYear" className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Current Year
              </Label>
              {isEditing ? (
                <Select
                  value={profile.currentYear}
                  onValueChange={(value) =>
                    setProfile({ ...profile, currentYear: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm py-2 px-3 rounded-md bg-muted/50">
                  {profile.currentYear || "Not set"}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Plan Card */}
      <Card className={cn(
        "overflow-hidden transition-all duration-300",
        hasActivePlan ? "border-green-500/30" : "border-primary/30"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg",
                hasActivePlan ? "bg-green-500/10" : "bg-primary/10"
              )}>
                <CreditCard className={cn(
                  "h-5 w-5",
                  hasActivePlan ? "text-green-500" : "text-primary"
                )} />
              </div>
              <div>
                <CardTitle className="text-lg">My Plan</CardTitle>
                <CardDescription>Your current subscription</CardDescription>
              </div>
            </div>
            {hasActivePlan && (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {hasActivePlan ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-500/5 to-emerald-500/5 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <Crown className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="font-semibold">Launch Member</p>
                    <p className="text-sm text-muted-foreground">
                      Full access to all features
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground line-through">
                    ₹{planDetails?.originalPrice || 300}
                  </p>
                  <p className="text-2xl font-bold text-green-500">
                    ₹{planDetails?.paidPrice || 0}
                  </p>
                </div>
              </div>

              {planDetails?.claimedAt && (
                <p className="text-xs text-muted-foreground text-center">
                  Claimed on{" "}
                  {new Date(planDetails.claimedAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <Gift className="h-6 w-6 text-primary animate-pulse" />
                  <div>
                    <p className="font-semibold">Launch Special</p>
                    <p className="text-sm text-muted-foreground">
                      Unlock all AI-powered features
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg text-muted-foreground line-through">
                    ₹300
                  </p>
                  <p className="text-3xl font-bold text-green-500">₹0</p>
                </div>
              </div>

              <Button
                onClick={() => setShowClaimModal(true)}
                className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                <Sparkles className="h-4 w-4" />
                Claim My Access
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appearance Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Appearance</CardTitle>
              <CardDescription>Customize your experience</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-primary" />
              ) : (
                <Sun className="h-5 w-5 text-yellow-500" />
              )}
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  {theme === "dark" ? "Dark mode" : "Light mode"}
                </p>
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Security Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Account Security</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google"
                className="h-5 w-5"
              />
              <div>
                <p className="font-medium">Google Account</p>
                <p className="text-sm text-muted-foreground">Connected</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              <Check className="h-3 w-3 mr-1" />
              Linked
            </Badge>
          </div>

          <Separator />

          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
