"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Target,
  Zap,
  BrainCircuit,
  FolderOpen,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Users,
  BookOpen,
  Rocket,
  Shield,
  Globe,
  Code2,
  Database,
  Cpu,
  Crown,
  Quote,
  Instagram,
  Mail,
  Copy,
  Check,
  Briefcase,
  Heart,
  Lock,
  UserCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Team data
const founder = {
  name: "Yaswanth Sai Yelisetty",
  role: "Founder",
  description: "B.Tech CSE Student. Building a scalable, student-led business empire that solves real-world academic challenges.",
  image: "/team/yaswanth.jpg",
};

const coFounders = [
  { 
    name: "T.G.S. Sri Ram", 
    role: "Co-Founder", 
    description: "Team Manager & Backend Developer. Architecting robust systems that power seamless learning experiences.",
    image: "/team/sriram.jpg",
  },
  { 
    name: "Vaishnavi", 
    role: "Co-Founder", 
    description: "Contributor Lead & Onboarding Specialist. Building bridges between students and opportunities.",
    image: "/team/vaishnavi.jpg",
  },
];

const coreTeam = [
  { name: "Syamala", role: "Marketing Lead", badge: "Outreach" },
  { name: "Jahnavi", role: "Reference Specialist", badge: "Research" },
  { name: "Ruthvik", role: "Frontend Developer", badge: "Development" },
];

const contentTeam = [
  { name: "Varun", role: "Content Verifier", badge: "Quality" },
  { name: "Sravya", role: "Material Creator", badge: "Content" },
  { name: "Vasanthi", role: "Material Creator", badge: "Content" },
  { name: "Raju", role: "Frontend Developer", badge: "Development" },
];

// Features
const features = [
  {
    icon: Lightbulb,
    title: "AI Learning Assistant",
    description: "Deconstructs complex topics into simple explanations, analogies, and mind maps with adaptive quizzes.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Target,
    title: "AI Exam Strategist",
    description: "Generates prioritized, Pomodoro-based timetables tailored to your syllabus and learning pace.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "AI Skill Accelerator",
    description: "Provides structured Skill Tracks with instant, personalized AI feedback on challenges.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: FolderOpen,
    title: "Centralized Materials Hub",
    description: "Admin-managed, topper-verified study materials organized by Branch, Year, and Subject.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: BrainCircuit,
    title: "Memory Palace",
    description: "A digital library for saving AI-generated insights, designed for spaced repetition.",
    color: "from-red-500 to-rose-500",
  },
];

// Problems and Solutions
const problems = [
  { title: "Complexity Overload", desc: "Dense information leads to passive reading" },
  { title: "Stressful Exam Prep", desc: "No strategy, last-minute cramming" },
  { title: "The Skill Gap", desc: "Academic pressure ignores real-world skills" },
  { title: "Resource Fragmentation", desc: "Hours wasted on unverified sources" },
  { title: "Knowledge Loss", desc: "No systematic way to revisit concepts" },
];

// Tech stack
const techStack = [
  { name: "Next.js 14", icon: Code2, desc: "High performance frontend" },
  { name: "Firebase", icon: Database, desc: "Secure backend & auth" },
  { name: "Google Gemini", icon: Cpu, desc: "Advanced AI reasoning" },
  { name: "Tailwind CSS", icon: Globe, desc: "Professional design" },
];

// Typewriter effect hook
function useTypewriter(text: string, speed: number = 50) {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let i = 0;
    setDisplayText("");
    setIsComplete(false);
    
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
}

// Professional Connect Section Component
function ConnectSection() {
  const { toast } = useToast();
  const [emailCopied, setEmailCopied] = useState(false);

  const handleCopyEmail = async () => {
    const email = "theunipeasy@gmail.com";
    try {
      await navigator.clipboard.writeText(email);
      setEmailCopied(true);
      toast({
        title: "Email Copied!",
        description: "theunipeasy@gmail.com has been copied to your clipboard.",
      });
      setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please manually copy: theunipeasy@gmail.com",
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
    >
      {/* Instagram Button */}
      <motion.a
        href="https://www.instagram.com/unipeasy?igsh=NjBteXFzMzloMmFu"
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative overflow-hidden rounded-xl px-6 py-3 transition-all duration-300"
      >
        {/* Instagram gradient background on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-muted group-hover:bg-transparent transition-colors duration-300" />
        <div className="absolute inset-[2px] bg-background/95 rounded-[10px] group-hover:bg-background/10 transition-colors duration-300" />
        
        <div className="relative flex items-center gap-3">
          <Instagram className="h-5 w-5 text-muted-foreground group-hover:text-white transition-colors duration-300" />
          <span className="font-medium text-muted-foreground group-hover:text-white transition-colors duration-300">
            @unipeasy
          </span>
        </div>
      </motion.a>

      <span className="hidden sm:block text-muted-foreground/50">•</span>

      {/* Email Button with Copy */}
      <motion.button
        onClick={handleCopyEmail}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative overflow-hidden rounded-xl px-6 py-3 transition-all duration-300"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-muted group-hover:bg-transparent transition-colors duration-300" />
        <div className="absolute inset-[2px] bg-background/95 rounded-[10px] group-hover:bg-primary/5 transition-colors duration-300" />
        
        <div className="relative flex items-center gap-3">
          {emailCopied ? (
            <>
              <Check className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
              <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                theunipeasy@gmail.com
              </span>
              <Copy className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary/70 transition-colors duration-300" />
            </>
          )}
        </div>
      </motion.button>
    </motion.div>
  );
}

export default function AboutPage() {
  const { displayText, isComplete } = useTypewriter("Academic Excellence, Redefined.", 60);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-6 gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Learning Platform
            </Badge>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {displayText}
            </span>
            {!isComplete && <span className="animate-pulse">|</span>}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8"
          >
            One centralized platform for the modern student. Verified materials, 
            AI-powered strategies, and industry-level skill tracks—all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Button asChild size="lg" className="gap-2">
              <Link href="/login">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">Explore Dashboard</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 border-y bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Quote className="h-10 w-10 text-primary/40 mx-auto mb-6" />
          <blockquote className="text-xl sm:text-2xl font-medium italic text-foreground/80">
            &quot;Unipeasy is not just about notes; it is about empowering students with 
            clarity, confidence, and convenience in their academic journey.&quot;
          </blockquote>
        </div>
      </section>

      {/* Problem vs Solution */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">The Challenge</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Problems We&apos;re Solving
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Problems */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-destructive mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                The Wall of Challenges
              </h3>
              {problems.map((problem, i) => (
                <motion.div
                  key={problem.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5"
                >
                  <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-destructive">{i + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{problem.title}</p>
                    <p className="text-sm text-muted-foreground">{problem.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Solutions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-500 mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Our Intelligent Solutions
              </h3>
              {features.slice(0, 5).map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-3 p-4 rounded-lg border border-green-500/20 bg-green-500/5"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    "bg-gradient-to-br", feature.color
                  )}>
                    <feature.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Features</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Everything You Need to Excel
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full group hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:border-primary/30 bg-background/50 backdrop-blur">
                  <CardContent className="p-6">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                      "bg-gradient-to-br", feature.color,
                      "group-hover:scale-110 transition-transform duration-300"
                    )}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Technology</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Powered By Modern Tech
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with cutting-edge technologies for performance, security, and intelligence
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6 rounded-xl border bg-card hover:bg-accent/50 transition-colors"
              >
                <tech.icon className="h-10 w-10 mx-auto mb-3 text-primary" />
                <h4 className="font-semibold">{tech.name}</h4>
                <p className="text-xs text-muted-foreground">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-500/5 via-cyan-500/5 to-blue-500/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
              <Shield className="h-3.5 w-3.5 mr-1" />
              Trust & Safety
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Protecting Students First
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Solving the trust issue that plagues most student platforms today. 
              Your safety and data privacy are our top priorities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Left - Our Commitment */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">Our Commitment</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Verified Internships Only</strong> — Every opportunity is manually verified by our team to protect you from fake listings and scams.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Community-Powered</strong> — Students can suggest internships they find, building a trusted network of opportunities together.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        <strong className="text-foreground">No Data Misuse</strong> — Your personal information stays with you. We never sell or share your data with third parties.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Transparent Operations</strong> — Built by students who understand your concerns and prioritize your interests.
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right - Why This Matters */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-full border-blue-500/20 bg-blue-500/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold">Why This Matters</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Too many student platforms exploit trust. Fake internships, data harvesting, 
                    and misleading opportunities have become common. We&apos;re different.
                  </p>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-background/50 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-sm">Suggest an Internship</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Found a great opportunity? Share it with fellow students! Our team verifies and 
                        adds legitimate internships to help everyone succeed.
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-background/50 border">
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="h-4 w-4 text-purple-500" />
                        <span className="font-medium text-sm">Your Data, Your Control</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        We use industry-standard encryption and never share your information. 
                        Your academic journey is private and protected.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Bottom Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
              <UserCheck className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-medium">
                Built by Students, For Students — Protecting your interests is our mission.
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Users className="h-3.5 w-3.5 mr-1" />
              Our Team
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Meet the Visionaries
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built by students, for students—a national movement of empowerment and innovation.
            </p>
          </div>

          {/* Founder Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto mb-8"
          >
            <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="h-24 w-24 border-4 border-primary/20">
                    <AvatarImage src={founder.image} />
                    <AvatarFallback className="text-2xl bg-primary/10">
                      {founder.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-purple-600">
                    <Crown className="h-3 w-3 mr-1" />
                    {founder.role}
                  </Badge>
                </div>
                <h3 className="text-xl font-bold mt-4">{founder.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{founder.description}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Co-Founders */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-center mb-6">Co-Founders</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {coFounders.map((cofounder, i) => (
                <motion.div
                  key={cofounder.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  viewport={{ once: true }}
                >
                  <Card className="overflow-hidden border-purple-500/30 bg-gradient-to-br from-purple-500/5 to-pink-500/5 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                    <CardContent className="p-5 text-center">
                      <div className="relative inline-block mb-3">
                        <Avatar className="h-20 w-20 border-4 border-purple-500/20">
                          <AvatarImage src={cofounder.image} />
                          <AvatarFallback className="text-xl bg-purple-500/10">
                            {cofounder.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500">
                          <Crown className="h-3 w-3 mr-1" />
                          {cofounder.role}
                        </Badge>
                      </div>
                      <h4 className="font-bold mt-3">{cofounder.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1.5">{cofounder.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Core Team */}
          <div className="mb-12">
            <h3 className="text-lg font-semibold text-center mb-6">Core Management & Development</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto">
              {coreTeam.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="text-center p-4 h-full hover:border-primary/30 transition-all duration-300 hover:shadow-md">
                    <div className="relative inline-block">
                      <Avatar className="h-16 w-16 mx-auto mb-3 group-hover:scale-105 transition-transform">
                        <AvatarFallback className="bg-primary/10 text-sm">
                          {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <Badge 
                        variant="secondary" 
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
                      >
                        {member.badge}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm">{member.name}</h4>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Content Team */}
          <div>
            <h3 className="text-lg font-semibold text-center mb-6">The Content & Quality Engine</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
              {contentTeam.map((member, i) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="group"
                >
                  <Card className="text-center p-4 hover:border-primary/30 transition-colors">
                    <div className="relative inline-block">
                      <Avatar className="h-14 w-14 mx-auto mb-2">
                        <AvatarFallback className="bg-primary/10 text-xs">
                          {member.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <Badge 
                        variant="outline" 
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {member.badge}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm">{member.name}</h4>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10">
            <CardContent className="p-8 sm:p-12 text-center">
              <Badge variant="secondary" className="mb-4 gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Launch Special
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Claim Your Free Access
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Get instant access to all AI-powered features and verified study materials.
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className="text-3xl text-muted-foreground line-through">₹300</span>
                <span className="text-5xl font-bold text-green-500">₹0</span>
              </div>

              <Button asChild size="lg" className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                <Link href="/login">
                  <Crown className="h-4 w-4" />
                  Get Started Now
                </Link>
              </Button>

              <p className="text-xs text-muted-foreground mt-4">
                No payment required • Instant activation
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer Quote */}
      <section className="py-12 border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <blockquote className="text-lg italic text-muted-foreground mb-8">
            &quot;Unipeasy is built by students, for students, growing as a national movement 
            of empowerment and innovation.&quot;
          </blockquote>
          
          {/* Connect Section */}
          <ConnectSection />
        </div>
      </section>
    </div>
  );
}
