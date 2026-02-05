"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import {
  Rocket,
  Sparkles,
  Target,
  Zap,
  BrainCircuit,
  FolderOpen,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  Crown,
  BookOpen,
  Clock,
  TrendingUp,
  Shield,
  Users,
  Instagram,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Features data
const features = [
  {
    icon: Lightbulb,
    title: "AI Learning Assistant",
    description: "Deconstructs complex topics into simple explanations, analogies, and interactive mind maps.",
    color: "from-yellow-500 to-orange-500",
    benefit: "Complexity Overload → Solved"
  },
  {
    icon: Target,
    title: "AI Exam Strategist",
    description: "Generates prioritized, Pomodoro-based timetables tailored to your syllabus and learning pace.",
    color: "from-blue-500 to-cyan-500",
    benefit: "Exam Stress → Eliminated"
  },
  {
    icon: Zap,
    title: "AI Skill Accelerator",
    description: "Provides structured Skill Tracks with instant, personalized AI feedback on challenges.",
    color: "from-purple-500 to-pink-500",
    benefit: "Skill Gap → Bridged"
  },
  {
    icon: FolderOpen,
    title: "Centralized Materials Hub",
    description: "Topper-verified study materials organized intuitively by Branch, Year, and Subject.",
    color: "from-green-500 to-emerald-500",
    benefit: "Resource Chaos → Organized"
  },
  {
    icon: BrainCircuit,
    title: "Memory Palace",
    description: "A digital library for saving AI-generated insights, designed to combat the forgetting curve.",
    color: "from-red-500 to-rose-500",
    benefit: "Knowledge Loss → Retained"
  },
];

// Problems data
const problems = [
  { icon: BookOpen, title: "Complexity Overload", desc: "Dense information leads to passive reading without understanding" },
  { icon: Clock, title: "Stressful Exam Prep", desc: "No strategy, last-minute cramming, and anxiety" },
  { icon: TrendingUp, title: "The Skill Gap", desc: "Academic pressure ignores real-world industry skills" },
  { icon: FolderOpen, title: "Resource Fragmentation", desc: "Hours wasted searching unverified sources" },
];

// Plan benefits
const planBenefits = [
  "Unlimited AI Learning Assistant access",
  "Personalized AI Exam Strategist roadmaps",
  "Full Skill Accelerator track library",
  "Complete Materials Hub access",
  "Memory Palace for knowledge retention",
  "Topper-verified study materials",
];

export default function HomePage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Check if user is already logged in and redirect to dashboard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is logged in, redirect to dashboard
        router.replace("/dashboard");
      } else {
        // User is not logged in, show the home page
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  // Show loading screen while checking auth state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b shadow-lg"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Rocket className="h-8 w-8 text-primary group-hover:rotate-12 transition-transform" />
              <span className="text-2xl font-bold font-headline">UniPeasy</span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("features")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </button>
              <Link
                href="/about"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button asChild variant="ghost">
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90">
                <Link href="/login">Sign Up</Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b"
          >
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => scrollToSection("features")}
                className="block w-full text-left py-2 text-muted-foreground hover:text-foreground"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("pricing")}
                className="block w-full text-left py-2 text-muted-foreground hover:text-foreground"
              >
                Pricing
              </button>
              <Link
                href="/about"
                className="block py-2 text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-3 border-t flex gap-3">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/login">Log In</Link>
                </Button>
                <Button asChild className="flex-1 bg-gradient-to-r from-primary to-purple-600">
                  <Link href="/login">Sign Up</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 gap-1.5 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Learning Platform
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-headline mb-6 leading-tight"
          >
            Master Your Entire Syllabus with{" "}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Your Personal AI Tutor
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            Stop searching, start learning. Get instant access to topper-verified notes
            and AI-powered study strategies. Free for a limited time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl shadow-primary/25"
            >
              <Link href="/login">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => scrollToSection("features")}
            >
              Learn More
            </Button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Topper-Verified Content
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Built by Students
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Powered by AI
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">The Challenge</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-headline mb-4">
              The Academic Struggle Is Real
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every engineering student faces these obstacles. We built UniPeasy to solve them.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map((problem, i) => (
              <motion.div
                key={problem.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-destructive/20 bg-destructive/5 hover:border-destructive/40 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                      <problem.icon className="h-6 w-6 text-destructive" />
                    </div>
                    <h3 className="font-semibold mb-2">{problem.title}</h3>
                    <p className="text-sm text-muted-foreground">{problem.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Our Solutions
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-headline mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Five AI-powered tools designed to transform your academic journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className={i === 0 ? "md:col-span-2 lg:col-span-1" : ""}
              >
                <Card className="h-full group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:border-primary/30 bg-background/50 backdrop-blur overflow-hidden">
                  <CardContent className="p-6 relative">
                    {/* Gradient glow on hover */}
                    <div className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                      "bg-gradient-to-br", feature.color
                    )} />

                    <div className="relative">
                      <div className={cn(
                        "w-14 h-14 rounded-xl flex items-center justify-center mb-4",
                        "bg-gradient-to-br", feature.color,
                        "group-hover:scale-110 transition-transform duration-300"
                      )}>
                        <feature.icon className="h-7 w-7 text-white" />
                      </div>

                      <Badge variant="outline" className="mb-3 text-xs">
                        {feature.benefit}
                      </Badge>

                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="secondary" className="mb-4">
              <Crown className="h-3.5 w-3.5 mr-1" />
              Launch Special
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-headline mb-4">
              One Plan, Complete Access
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Invest in your clarity and career for the price of a single textbook
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
              <CardContent className="p-8 sm:p-12">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  {/* Pricing Info */}
                  <div className="text-center lg:text-left">
                    {/* Launch Special Badge */}
                    <div className="inline-block mb-4 p-[1px] rounded-full bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-500">
                      <Badge className="bg-background text-foreground hover:bg-background rounded-full px-4">
                        🚀 Founder&apos;s Launch Special
                      </Badge>
                    </div>

                    <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                      <span className="text-2xl sm:text-3xl font-bold text-muted-foreground/40 line-through decoration-red-500/50 decoration-2">₹300</span>
                      <span className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">₹0</span>
                      <span className="text-sm font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">Launch Special</span>
                    </div>
                    <p className="text-muted-foreground mb-6">
                      Get full access to all premium features for <span className="text-green-500 font-semibold">FREE</span> during our launch phase
                    </p>
                    <Button
                      asChild
                      size="lg"
                      className="w-full lg:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <Link href="/login">
                        Claim Free Access <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>

                  {/* Benefits List */}
                  <div className="space-y-3">
                    {planBenefits.map((benefit, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm sm:text-base">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="mt-8 pt-8 border-t flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    Topper-Verified Quality
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Powered by Google Gemini AI
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-headline mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of engineering students who are already learning smarter with UniPeasy
            </p>
            <Button
              asChild
              size="lg"
              className="text-lg px-10 py-6 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl shadow-primary/25"
            >
              <Link href="/login">
                Start Your Journey Today <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <Rocket className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold font-headline">UniPeasy</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Built by students, for students. A national movement of educational empowerment.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Materials Hub</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">AI Strategist</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Skill Tracks</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
                <li><Link href="/about" className="hover:text-foreground transition-colors">Our Team</Link></li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a
                    href="https://www.instagram.com/unipeasy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    <Instagram className="h-4 w-4" />
                    @unipeasy
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:theunipeasy@gmail.com"
                    className="flex items-center gap-2 hover:text-foreground transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    theunipeasy@gmail.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} UniPeasy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
