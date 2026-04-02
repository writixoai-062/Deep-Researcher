import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
  Search, Sun, Moon, Menu, X, ChevronDown, ChevronUp,
  Brain, Bot, FileText, Globe, CreditCard, Lock,
  ArrowRight, Check, Star, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

/* ─── Waiting list visibility: show for 2 weeks from launch (Apr 2, 2026) ─── */
const LAUNCH_DATE = new Date("2026-04-02").getTime();
const TWO_WEEKS_MS = 14 * 24 * 60 * 60 * 1000;
const showWaitingList = Date.now() < LAUNCH_DATE + TWO_WEEKS_MS;

/* ─── SVG Social Icons ─── */
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function ProductHuntIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.604 8.4h-3.405V12h3.405c.993 0 1.8-.807 1.8-1.8 0-.993-.807-1.8-1.8-1.8zM12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.604 14.4h-3.405V18H7.8V6h5.804c2.319 0 4.2 1.881 4.2 4.2 0 2.319-1.881 4.2-4.2 4.2z" />
    </svg>
  );
}

/* ─── Feature data ─── */
const features = [
  {
    icon: Search,
    title: "AI Thought Analysis",
    desc: "Reveals why ChatGPT gave that specific answer, surfacing the reasoning chains and decision points behind every response.",
  },
  {
    icon: Bot,
    title: "Boss Agent",
    desc: "Auto-detects your category and recommends the best specialized agent for your exact use case — instantly.",
  },
  {
    icon: FileText,
    title: "10 Specialized Agents",
    desc: "Content, Code, Prompt, Hook, Language Bridge and 5 more — purpose-built agents for every task you face.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    desc: "Full support for English, Urdu, Hindi, Arabic and 20+ additional languages with native-quality output.",
  },
  {
    icon: CreditCard,
    title: "Smart Credits",
    desc: "5 free monthly credits, Pro 100 credits, Business unlimited — flexible pricing that scales with your work.",
  },
  {
    icon: Lock,
    title: "Privacy First",
    desc: "Your data is never stored, never logged, never sold. Complete end-to-end privacy by design.",
  },
];

/* ─── FAQ data ─── */
const faqs = [
  {
    q: "What is ThoughtScope?",
    a: "ThoughtScope is an AI conversation intelligence platform. You paste any ChatGPT conversation, and our system reveals the underlying reasoning, biases, and patterns in the AI's responses — plus recommends the best specialized agent for your follow-up work.",
  },
  {
    q: "How many agents are there?",
    a: "ThoughtScope includes 10 specialized agents: Content Agent, Code Agent, Prompt Engineer, Hook Writer, Language Bridge, Summary Agent, Research Agent, Debug Agent, SEO Agent, and the Boss Agent that automatically routes you to the best one.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. There are no long-term contracts, no cancellation fees, and no hidden terms. Cancel your subscription with one click from your account settings — your access continues until the end of your billing period.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. We operate on a strict zero-retention policy. Your conversations are analyzed in-memory and never written to disk. We do not train on your data. Your privacy is non-negotiable.",
  },
];

/* ─── Reviews data ─── */
const reviews = [
  {
    text: "Finally I understand why AI gives certain answers. I was spending hours guessing what prompted a bad response — ThoughtScope shows me the exact reasoning chain in seconds.",
    name: "Sarah M.",
    title: "Content Creator",
    initials: "SM",
    color: "from-violet-500 to-purple-600",
  },
  {
    text: "The Boss Agent is a game changer for my freelance workflow. It figures out exactly which specialized agent I need without me having to guess. My output quality doubled.",
    name: "Ali K.",
    title: "Freelancer & Consultant",
    initials: "AK",
    color: "from-teal-500 to-green-600",
  },
  {
    text: "Saved me hours of prompt testing every week. Instead of trial and error, I now see exactly why a prompt worked or failed and fix it immediately.",
    name: "Maya R.",
    title: "Senior Developer",
    initials: "MR",
    color: "from-blue-500 to-indigo-600",
  },
];

/* ─── Accordion item ─── */
function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <button
        data-testid={`faq-toggle-${q.slice(0, 20)}`}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/50 transition-colors"
        aria-expanded={open}
      >
        <span className="font-semibold text-foreground">{q}</span>
        {open ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0 ml-4" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 ml-4" />
        )}
      </button>
      {open && (
        <div className="px-6 pb-5 text-muted-foreground text-sm leading-relaxed border-t border-border pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

/* ─── Intersection observer hook for scroll animations ─── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ─── Main component ─── */
export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const heroIn = useInView(0.1);
  const featuresIn = useInView(0.1);
  const stepsIn = useInView(0.1);
  const pricingIn = useInView(0.1);
  const reviewsIn = useInView(0.1);
  const faqIn = useInView(0.1);
  const ctaIn = useInView(0.1);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "#faq" },
  ];

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (email) setJoined(true);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── STICKY HEADER ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <a href="#home" className="flex items-center gap-2.5 shrink-0 group" data-testid="link-logo">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shadow-sm">
              <Search className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">ThoughtScope</span>
          </a>

          {/* Center nav — desktop */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                data-testid={`nav-${l.label.toLowerCase()}`}
                className="px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Right controls — desktop */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme toggle */}
            {mounted && (
              <button
                data-testid="button-theme-toggle"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <Button variant="ghost" size="sm" data-testid="button-login" className="text-sm">Login</Button>
            <Button size="sm" data-testid="button-signup" className="text-sm bg-primary text-primary-foreground hover:opacity-90">Sign Up</Button>
            {showWaitingList && (
              <button
                data-testid="button-join-waitlist-header"
                className="pulse-glow animate-pulse px-4 py-2 rounded-full text-sm font-semibold text-white gradient-bg hover:opacity-90 transition-opacity"
              >
                Join Waiting List
              </button>
            )}
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {mounted && (
              <button
                data-testid="button-theme-toggle-mobile"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  data-testid="button-mobile-menu"
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Open menu"
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-6 flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-lg">ThoughtScope</span>
                </div>
                <nav className="flex flex-col gap-1">
                  {navLinks.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      {l.label}
                    </a>
                  ))}
                </nav>
                <div className="flex flex-col gap-3 pt-2 border-t border-border">
                  <Button variant="ghost" className="w-full justify-start" data-testid="button-login-mobile">Login</Button>
                  <Button className="w-full gradient-bg border-0 text-white hover:opacity-90" data-testid="button-signup-mobile">Sign Up</Button>
                  {showWaitingList && (
                    <button
                      data-testid="button-join-waitlist-mobile"
                      className="animate-pulse w-full py-2.5 rounded-full font-semibold text-sm text-white gradient-bg hover:opacity-90 transition-opacity"
                    >
                      Join Waiting List
                    </button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>

        {/* ── HERO SECTION ── */}
        <section
          id="home"
          ref={heroIn.ref}
          className="min-h-screen flex items-center justify-center pt-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#10A37F]/10 to-[#3B82F6]/10 blur-3xl" />
            <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-[#10A37F]/5 blur-2xl" />
            <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-[#3B82F6]/5 blur-2xl" />
          </div>

          <div className={`relative z-10 max-w-4xl mx-auto text-center transition-all duration-700 ${heroIn.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card text-sm font-medium text-muted-foreground mb-6">
              <Search className="w-3.5 h-3.5 text-primary" />
              AI Thought Analyzer
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-6">
              <span className="text-foreground">See How </span>
              <span className="gradient-text">AI Really Thinks</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Paste any ChatGPT conversation — Get instant analysis of why AI gave that answer, plus 10 specialized agents ready to help you go further.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              {showWaitingList && (
                <button
                  data-testid="button-hero-waitlist"
                  className="pulse-glow w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-white gradient-bg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  Join Waiting List
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              <Button
                variant="outline"
                size="lg"
                data-testid="button-hero-demo"
                className="w-full sm:w-auto px-8 rounded-full"
              >
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> 1000+ users</span>
              <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
              <span>Global coverage</span>
              <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
              <span>Launching soon</span>
            </div>
          </div>
        </section>

        {/* ── FEATURES SECTION ── */}
        <section
          id="features"
          ref={featuresIn.ref}
          className="py-24 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <div className={`text-center mb-16 transition-all duration-700 ${featuresIn.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need to understand AI</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Six powerful capabilities that transform how you analyze, improve, and scale your AI conversations.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    data-testid={`card-feature-${i}`}
                    className={`bg-card border border-card-border rounded-xl p-6 hover:shadow-lg transition-all duration-500 group ${
                      featuresIn.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                    style={{ transitionDelay: featuresIn.inView ? `${i * 80}ms` : "0ms" }}
                  >
                    <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section
          id="how-it-works"
          ref={stepsIn.ref}
          className="py-24 px-4 sm:px-6 lg:px-8 bg-card/50"
        >
          <div className="max-w-4xl mx-auto">
            <div className={`text-center mb-16 transition-all duration-700 ${stepsIn.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
              <p className="text-muted-foreground text-lg">Three simple steps to unlock AI transparency</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector lines — desktop */}
              <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-[#10A37F] to-[#3B82F6] opacity-30" />
              {[
                { num: "01", icon: FileText, label: "Paste your ChatGPT link", desc: "Copy your ChatGPT conversation URL or paste the full text directly into ThoughtScope." },
                { num: "02", icon: Brain, label: "AI analyzes everything", desc: "Our system dissects the question, the answer, and the reasoning chain behind every response." },
                { num: "03", icon: Search, label: "Get insights + agent match", desc: "Receive a full analysis report and an automatic recommendation for the best specialized agent." },
              ].map((step, i) => (
                <div
                  key={step.num}
                  data-testid={`step-${i + 1}`}
                  className={`text-center transition-all duration-500 ${stepsIn.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: stepsIn.inView ? `${i * 120}ms` : "0ms" }}
                >
                  <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full gradient-bg text-white font-bold text-xl mb-5 shadow-lg mx-auto">
                    <step.icon className="w-7 h-7" />
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-background border border-border text-xs font-bold text-foreground flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{step.label}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section
          id="pricing"
          ref={pricingIn.ref}
          className="py-24 px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-5xl mx-auto">
            <div className={`text-center mb-16 transition-all duration-700 ${pricingIn.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
              <p className="text-muted-foreground text-lg">Start free. Scale when you're ready.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free */}
              <div
                data-testid="card-pricing-free"
                className={`bg-card border border-card-border rounded-xl p-8 flex flex-col transition-all duration-500 ${pricingIn.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: pricingIn.inView ? "0ms" : "0ms" }}
              >
                <div className="mb-6">
                  <h3 className="font-bold text-xl mb-1">Free</h3>
                  <p className="text-muted-foreground text-sm mb-4">Perfect to get started</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black">$0</span>
                    <span className="text-muted-foreground mb-1">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {["5 credits/month", "2 specialized agents", "Basic AI analysis", "Email support"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full rounded-xl" data-testid="button-free-plan">Get Started Free</Button>
              </div>

              {/* Pro — highlighted */}
              <div
                data-testid="card-pricing-pro"
                className={`relative bg-card border-2 border-primary rounded-xl p-8 flex flex-col shadow-xl shadow-primary/10 transition-all duration-500 ${pricingIn.inView ? "opacity-100 translate-y-0 scale-105" : "opacity-0 translate-y-8 scale-100"}`}
                style={{ transitionDelay: pricingIn.inView ? "100ms" : "0ms" }}
              >
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-xs font-bold text-white gradient-bg shadow-sm">
                    Most Popular
                  </span>
                </div>
                <div className="mb-6 mt-2">
                  <h3 className="font-bold text-xl mb-1">Pro</h3>
                  <p className="text-muted-foreground text-sm mb-4">For serious users</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black">$9.99</span>
                    <span className="text-muted-foreground mb-1">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {["100 credits/month", "All 10 specialized agents", "Deep AI analysis", "Priority support", "PDF & JSON export"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full rounded-xl gradient-bg border-0 text-white hover:opacity-90" data-testid="button-pro-plan">
                  Get Started
                </Button>
              </div>

              {/* Business */}
              <div
                data-testid="card-pricing-business"
                className={`bg-card border border-card-border rounded-xl p-8 flex flex-col transition-all duration-500 ${pricingIn.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{ transitionDelay: pricingIn.inView ? "200ms" : "0ms" }}
              >
                <div className="mb-6">
                  <h3 className="font-bold text-xl mb-1">Business</h3>
                  <p className="text-muted-foreground text-sm mb-4">For teams and enterprises</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black">$29.99</span>
                    <span className="text-muted-foreground mb-1">/month</span>
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {["Unlimited credits", "All Pro features", "API access", "Team collaboration", "Custom integrations", "SSO support"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full rounded-xl" data-testid="button-business-plan">Contact Sales</Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── REVIEWS ── */}
        <section
          id="reviews"
          ref={reviewsIn.ref}
          className="py-24 px-4 sm:px-6 lg:px-8 bg-card/50"
        >
          <div className="max-w-5xl mx-auto">
            <div className={`text-center mb-16 transition-all duration-700 ${reviewsIn.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Loved by researchers and creators</h2>
              <p className="text-muted-foreground text-lg">Join thousands already using ThoughtScope to unlock AI transparency.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((r, i) => (
                <div
                  key={r.name}
                  data-testid={`card-review-${i}`}
                  className={`bg-card border border-card-border rounded-xl p-6 flex flex-col gap-4 transition-all duration-500 ${reviewsIn.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                  style={{ transitionDelay: reviewsIn.inView ? `${i * 100}ms` : "0ms" }}
                >
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">"{r.text}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-border">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${r.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {r.initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.title}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA SECTION ── */}
        <section
          ref={ctaIn.ref}
          className="py-24 px-4 sm:px-6 lg:px-8"
        >
          <div className={`max-w-3xl mx-auto text-center transition-all duration-700 ${ctaIn.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to understand AI better?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Join thousands of researchers, creators, and developers who trust ThoughtScope.
            </p>
            {showWaitingList && (
              <button
                data-testid="button-cta-waitlist"
                className="pulse-glow animate-pulse inline-flex items-center gap-2 px-10 py-4 rounded-full font-bold text-lg text-white gradient-bg hover:opacity-90 transition-opacity shadow-lg"
              >
                Join Waiting List
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section
          id="faq"
          ref={faqIn.ref}
          className="py-24 px-4 sm:px-6 lg:px-8 bg-card/50"
        >
          <div className="max-w-2xl mx-auto">
            <div className={`text-center mb-12 transition-all duration-700 ${faqIn.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Frequently asked questions</h2>
              <p className="text-muted-foreground">Everything you need to know about ThoughtScope.</p>
            </div>
            <div className={`space-y-3 transition-all duration-700 delay-100 ${faqIn.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              {faqs.map((f) => (
                <AccordionItem key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── JOIN FOR FREE / EMAIL CAPTURE ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-6">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Join for free</h2>
            <p className="text-muted-foreground mb-2">
              First 20 users get a 20% lifetime discount — act fast.
            </p>
            <p className="text-xs text-muted-foreground mb-8">No spam. No credit card. Cancel anytime.</p>
            {joined ? (
              <div className="flex items-center justify-center gap-2 py-4 px-6 bg-primary/10 border border-primary/20 rounded-xl text-primary font-semibold">
                <Check className="w-5 h-5" />
                You're on the list! We'll be in touch.
              </div>
            ) : (
              <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-sm"
                />
                <button
                  type="submit"
                  data-testid="button-email-submit"
                  className="px-6 py-3 rounded-xl font-semibold text-sm text-white gradient-bg hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Join Waiting List
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">

            {/* Col 1: Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
                  <Search className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-base">ThoughtScope</span>
              </div>
              <p className="text-sm text-muted-foreground mb-5 leading-relaxed max-w-xs">
                Unveiling the cognitive architecture behind AI — one conversation at a time.
              </p>
              <div className="flex gap-3">
                <a href="#" data-testid="link-twitter" aria-label="Twitter/X" className="text-muted-foreground hover:text-foreground transition-colors">
                  <TwitterIcon className="w-5 h-5" />
                </a>
                <a href="#" data-testid="link-linkedin" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground transition-colors">
                  <LinkedInIcon className="w-5 h-5" />
                </a>
                <a href="#" data-testid="link-github" aria-label="GitHub" className="text-muted-foreground hover:text-foreground transition-colors">
                  <GitHubIcon className="w-5 h-5" />
                </a>
                <a href="#" data-testid="link-producthunt" aria-label="Product Hunt" className="text-muted-foreground hover:text-foreground transition-colors">
                  <ProductHuntIcon className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Col 2: Product */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                {["Features", "Pricing", "Agents", "API"].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Social & Legal */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3">
                {["Documentation", "Status", "Community", "Blog"].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span>© 2026 ThoughtScope. All rights reserved.</span>
            <div className="flex gap-5">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
