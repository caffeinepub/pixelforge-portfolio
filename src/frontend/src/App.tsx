import {
  ArrowUpRight,
  ChevronRight,
  Code2,
  ExternalLink,
  FileText,
  Globe,
  Layers,
  Mail,
  Menu,
  Play,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import PromoVideo from "./components/PromoVideo";

// ── useInView hook ──────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ── AnimatedSection wrapper ──────────────────────────────────────────
interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: AnimatedSectionProps) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={`animate-in-hidden ${visible ? "animate-in-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ── Navbar ───────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Contact", href: "#contact" },
];

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleNavClick = useCallback((href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "nav-glass" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          type="button"
          onClick={() => handleNavClick("#hero")}
          data-ocid="nav.link"
          className="flex items-center gap-2 font-display font-bold text-xl tracking-tight bg-transparent border-0 cursor-pointer"
        >
          <span className="gradient-text">PixelForge</span>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <button
              type="button"
              key={link.href}
              data-ocid="nav.link"
              onClick={() => handleNavClick(link.href)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-md hover:bg-white/5 bg-transparent border-0 cursor-pointer"
            >
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleNavClick("#contact")}
            data-ocid="nav.primary_button"
            className="ml-4 px-5 py-2 text-sm font-semibold rounded-lg btn-glow-primary text-white cursor-pointer border-0"
          >
            Hire Us
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          data-ocid="nav.toggle"
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden nav-glass border-t border-white/5 px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <button
              type="button"
              key={link.href}
              data-ocid="nav.link"
              onClick={() => handleNavClick(link.href)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5 bg-transparent border-0 cursor-pointer w-full text-left"
            >
              <ChevronRight size={14} className="text-primary/60" />
              {link.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleNavClick("#contact")}
            data-ocid="nav.primary_button"
            className="mt-2 px-5 py-3 text-sm font-semibold rounded-lg btn-glow-primary text-white text-center border-0 cursor-pointer"
          >
            Hire Us
          </button>
        </div>
      )}
    </header>
  );
}

// ── Hero Section ──────────────────────────────────────────────────────
interface HeroSectionProps {
  onWatchPromo: () => void;
}

function HeroSection({ onWatchPromo }: HeroSectionProps) {
  const handleScroll = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="blob-animate absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, oklch(0.62 0.24 285) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="blob-animate-delay absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.22 250) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="blob-animate-slow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.55 0.22 270) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.62 0.24 285 / 0.4) 1px, transparent 1px), linear-gradient(90deg, oklch(0.62 0.24 285 / 0.4) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-sm font-medium text-primary/90 animate-in-hidden animate-in-visible">
          <Sparkles size={14} />
          Premium Web Design Studio
        </div>

        {/* Heading */}
        <h1
          className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.92] tracking-tight mb-6"
          style={{
            letterSpacing: "-0.04em",
            fontVariationSettings: '"wght" 900',
          }}
        >
          <span
            className="block"
            style={{
              background:
                "linear-gradient(110deg, oklch(0.88 0.18 285) 0%, oklch(0.80 0.26 275) 35%, oklch(0.72 0.26 255) 65%, oklch(0.78 0.20 240) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Modern Web
          </span>
          <span
            className="block"
            style={{
              background:
                "linear-gradient(110deg, oklch(0.75 0.22 265) 0%, oklch(0.82 0.20 250) 50%, oklch(0.90 0.12 240) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Designer
          </span>
        </h1>

        {/* Subheading */}
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed mb-10">
          Creating clean, high-converting websites that help businesses grow
          online.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            data-ocid="hero.primary_button"
            onClick={() => handleScroll("#portfolio")}
            className="btn-glow-primary px-8 py-3.5 rounded-xl text-white font-semibold text-base flex items-center gap-2"
          >
            View Portfolio
            <ArrowUpRight size={18} />
          </button>
          <button
            type="button"
            data-ocid="hero.secondary_button"
            onClick={() => handleScroll("#contact")}
            className="btn-glow-outline px-8 py-3.5 rounded-xl font-semibold text-base flex items-center gap-2 bg-transparent"
          >
            Contact Me
            <Mail size={18} />
          </button>
          <button
            type="button"
            data-ocid="hero.watch_promo_button"
            onClick={onWatchPromo}
            className="px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 bg-transparent border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-all duration-200"
          >
            <Play size={14} fill="currentColor" />
            Watch Our Story
          </button>
        </div>

        {/* Trust badges */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground/60 font-mono">
          {[
            "100+ Projects Delivered",
            "5-Star Rated",
            "Fast Turnaround",
            "Mobile-First",
          ].map((badge) => (
            <span key={badge} className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--pf-violet)" }}
              />
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/40 text-xs">
        <div
          className="w-px h-12"
          style={{
            background:
              "linear-gradient(to bottom, transparent, oklch(0.62 0.24 285 / 0.5))",
          }}
        />
        scroll
      </div>
    </section>
  );
}

// ── About Section ──────────────────────────────────────────────────────
function AboutSection() {
  const { ref: titleRef, visible: titleVisible } = useInView();
  const { ref: textRef, visible: textVisible } = useInView();
  const { ref: statsRef, visible: statsVisible } = useInView();

  const stats = [
    { value: "100+", label: "Projects Completed" },
    { value: "50+", label: "Happy Clients" },
    { value: "5★", label: "Average Rating" },
    { value: "3yr+", label: "Experience" },
  ];

  return (
    <section id="about" className="section-pad relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute right-0 top-1/4 w-96 h-96 opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.65 0.22 250) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Text side */}
          <div>
            <div
              ref={titleRef}
              className={`animate-in-hidden ${titleVisible ? "animate-in-visible" : ""}`}
            >
              <span className="text-sm font-mono font-medium text-primary/70 tracking-widest uppercase mb-4 block">
                Who We Are
              </span>
              <h2 className="font-display font-bold text-4xl md:text-5xl leading-tight mb-8">
                About <span className="gradient-text">PixelForge</span>
              </h2>
            </div>

            <div
              ref={textRef}
              className={`animate-in-hidden ${textVisible ? "animate-in-visible" : ""} space-y-5 text-muted-foreground leading-relaxed`}
              style={{ transitionDelay: "150ms" }}
            >
              <p className="text-lg">
                At PixelForge, we specialize in crafting modern, fast, and
                visually stunning websites that help businesses build a powerful
                online presence.
              </p>
              <p>
                Every project is built with precision, creativity, and a deep
                understanding of what drives results — combining beautiful
                design with performance to create digital experiences your
                audience will remember.
              </p>
              <p>
                From sleek landing pages to full-featured business websites, our
                work is rooted in strategy, refined through design, and brought
                to life with clean, performant code.
              </p>
            </div>

            <div
              className={`animate-in-hidden ${textVisible ? "animate-in-visible" : ""} mt-8`}
              style={{ transitionDelay: "250ms" }}
            >
              <button
                type="button"
                onClick={() =>
                  document
                    .querySelector("#contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="btn-glow-primary px-7 py-3 rounded-xl text-white font-semibold flex items-center gap-2"
              >
                Start a Project
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>

          {/* Stats side */}
          <div
            ref={statsRef}
            className={`animate-in-hidden ${statsVisible ? "animate-in-visible" : ""}`}
            style={{ transitionDelay: "100ms" }}
          >
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="glass-card rounded-2xl p-8 flex flex-col items-center text-center service-card"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <span
                    className="font-display font-extrabold text-4xl gradient-text mb-2"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {stat.value}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Decorative element */}
            <div className="mt-4 glass-card rounded-2xl p-6 flex items-center gap-4 service-card">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--pf-gradient)" }}
              >
                <Globe size={22} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">
                  Available for New Projects
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Fast turnaround · Pixel-perfect execution
                </p>
              </div>
              <div
                className="ml-auto w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse"
                style={{ background: "oklch(0.72 0.22 155)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Services Section ──────────────────────────────────────────────────
const SERVICES = [
  {
    icon: Layers,
    title: "Custom Website Design",
    description:
      "Bespoke designs built from scratch — every pixel crafted to reflect your brand identity and capture your audience's attention.",
    accent: "oklch(0.62 0.24 285)",
  },
  {
    icon: FileText,
    title: "Landing Page Design",
    description:
      "High-converting landing pages with clear hierarchy, persuasive copy placement, and strategic CTAs that turn visitors into customers.",
    accent: "oklch(0.65 0.22 250)",
  },
  {
    icon: Code2,
    title: "Business Website Development",
    description:
      "Full-featured business websites with performance-first architecture, clean code, and seamless CMS integration.",
    accent: "oklch(0.58 0.22 270)",
  },
  {
    icon: RefreshCw,
    title: "Website Redesign",
    description:
      "Transform your outdated website into a modern digital experience that reflects where your business is today.",
    accent: "oklch(0.68 0.20 260)",
  },
];

function ServicesSection() {
  const { ref: titleRef, visible: titleVisible } = useInView();

  return (
    <section id="services" className="section-pad relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute -left-24 top-1/3 w-80 h-80 opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.62 0.24 285) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <div
          ref={titleRef}
          className={`animate-in-hidden ${titleVisible ? "animate-in-visible" : ""} text-center mb-16`}
        >
          <span className="text-sm font-mono font-medium text-primary/70 tracking-widest uppercase mb-4 block">
            What We Offer
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-5">
            What We <span className="gradient-text">Do</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From concept to launch, we handle every aspect of your web presence
            with craft and intent.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <AnimatedSection key={service.title} delay={i * 80}>
                <div
                  data-ocid={`services.item.${i + 1}`}
                  className="service-card rounded-2xl p-7 h-full flex flex-col gap-5 cursor-default"
                >
                  {/* Icon */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `${service.accent}20`,
                      border: `1px solid ${service.accent}40`,
                    }}
                  >
                    <Icon size={20} style={{ color: service.accent }} />
                  </div>

                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-3">
                      {service.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-auto pt-2">
                    <span
                      className="text-xs font-semibold flex items-center gap-1"
                      style={{ color: service.accent }}
                    >
                      Learn More <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Portfolio Section ──────────────────────────────────────────────────
const PROJECTS = [
  {
    title: "Business Website",
    type: "Corporate",
    image: "/assets/generated/portfolio-business-website.dim_800x500.jpg",
    tags: ["Branding", "UI/UX", "Development"],
    gradient: "from-violet-600/40 to-blue-600/40",
  },
  {
    title: "Landing Page",
    type: "Conversion",
    image: "/assets/generated/portfolio-landing-page.dim_800x500.jpg",
    tags: ["CRO", "Design", "Copy"],
    gradient: "from-blue-600/40 to-indigo-600/40",
  },
  {
    title: "Portfolio Website",
    type: "Personal Brand",
    image: "/assets/generated/portfolio-portfolio-website.dim_800x500.jpg",
    tags: ["Design", "Animation", "CMS"],
    gradient: "from-indigo-600/40 to-purple-600/40",
  },
  {
    title: "Startup Website",
    type: "Product Launch",
    image: "/assets/generated/portfolio-startup-website.dim_800x500.jpg",
    tags: ["MVP", "UI/UX", "Branding"],
    gradient: "from-purple-600/40 to-violet-600/40",
  },
  {
    title: "Agency Website",
    type: "Creative Agency",
    image: "/assets/generated/portfolio-agency-website.dim_800x500.jpg",
    tags: ["Motion", "Design", "Dev"],
    gradient: "from-violet-600/40 to-cyan-600/40",
  },
];

function PortfolioCard({
  project,
  index,
}: {
  project: (typeof PROJECTS)[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <AnimatedSection delay={index * 100}>
      <div
        data-ocid={`portfolio.item.${index + 1}`}
        className="portfolio-card rounded-2xl overflow-hidden cursor-pointer group"
        style={{
          background: "oklch(0.105 0.015 285 / 0.9)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Image container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-107"
            loading="lazy"
          />
          {/* Gradient overlay on hover */}
          <div
            className={`absolute inset-0 bg-gradient-to-t ${project.gradient} transition-opacity duration-300 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          />
          {/* View project button on hover */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
              hovered ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <div className="btn-glow-primary px-5 py-2.5 rounded-xl text-white font-semibold text-sm flex items-center gap-2">
              View Project <ExternalLink size={14} />
            </div>
          </div>
        </div>

        {/* Card footer */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-display font-bold text-base text-foreground">
                {project.title}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {project.type}
              </p>
            </div>
            <ArrowUpRight
              size={16}
              className={`text-primary/60 transition-transform duration-200 flex-shrink-0 mt-0.5 ${
                hovered ? "translate-x-0.5 -translate-y-0.5 text-primary" : ""
              }`}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: "oklch(0.62 0.24 285 / 0.12)",
                  color: "oklch(0.75 0.14 285)",
                  border: "1px solid oklch(0.62 0.24 285 / 0.2)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

function PortfolioSection() {
  const { ref: titleRef, visible: titleVisible } = useInView();

  return (
    <section id="portfolio" className="section-pad relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute right-0 bottom-0 w-96 h-96 opacity-10"
          style={{
            background:
              "radial-gradient(circle, oklch(0.62 0.24 285) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* Title */}
        <div
          ref={titleRef}
          className={`animate-in-hidden ${titleVisible ? "animate-in-visible" : ""} text-center mb-16`}
        >
          <span className="text-sm font-mono font-medium text-primary/70 tracking-widest uppercase mb-4 block">
            Case Studies
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-5">
            Our <span className="gradient-text">Work</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A selection of recent projects — each built with craft, purpose, and
            measurable impact.
          </p>
        </div>

        {/* Projects grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROJECTS.map((project, i) => (
            <PortfolioCard key={project.title} project={project} index={i} />
          ))}
        </div>

        {/* CTA */}
        <AnimatedSection className="text-center mt-14" delay={200}>
          <p className="text-muted-foreground mb-5">
            Like what you see? Let&apos;s build something great together.
          </p>
          <button
            type="button"
            onClick={() =>
              document
                .querySelector("#contact")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="btn-glow-primary px-8 py-3.5 rounded-xl text-white font-semibold text-base inline-flex items-center gap-2"
          >
            Start Your Project <ArrowUpRight size={18} />
          </button>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ── Contact Section ──────────────────────────────────────────────────
function ContactSection() {
  const { ref: titleRef, visible: titleVisible } = useInView();
  const { ref: cardRef, visible: cardVisible } = useInView();

  return (
    <section id="contact" className="section-pad relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[600px] h-[400px] opacity-15"
          style={{
            background:
              "radial-gradient(ellipse, oklch(0.62 0.24 285) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <div
          ref={titleRef}
          className={`animate-in-hidden ${titleVisible ? "animate-in-visible" : ""} text-center mb-14`}
        >
          <span className="text-sm font-mono font-medium text-primary/70 tracking-widest uppercase mb-4 block">
            Let's Talk
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl mb-5">
            Get In <span className="gradient-text">Touch</span>
          </h2>
          <p className="text-muted-foreground text-xl max-w-xl mx-auto">
            Have a project in mind? Let&apos;s build something great together.
          </p>
        </div>

        <div
          ref={cardRef}
          className={`animate-in-hidden ${cardVisible ? "animate-in-visible" : ""} glass-card rounded-3xl p-10 md:p-14 text-center`}
          style={{
            border: "1px solid oklch(0.62 0.24 285 / 0.25)",
            boxShadow:
              "0 0 60px oklch(0.62 0.24 285 / 0.07), 0 24px 80px oklch(0 0 0 / 0.3)",
          }}
        >
          {/* Email display */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "var(--pf-gradient)" }}
            >
              <Mail size={22} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-0.5">
                Email Us
              </p>
              <a
                data-ocid="contact.link"
                href="mailto:pixelforge1515@gmail.com"
                className="text-lg font-semibold text-foreground hover:text-primary transition-colors duration-200 gradient-text-reverse"
              >
                pixelforge1515@gmail.com
              </a>
            </div>
          </div>

          <div className="gradient-divider mb-8 max-w-xs mx-auto" />

          <p className="text-muted-foreground mb-8 text-lg">
            We typically respond within{" "}
            <span className="text-foreground font-semibold">24 hours</span>.
            <br className="hidden sm:block" />
            Ready to transform your online presence?
          </p>

          <a
            data-ocid="contact.button"
            href="mailto:pixelforge1515@gmail.com"
            className="btn-glow-primary inline-flex items-center gap-2 px-10 py-4 rounded-xl text-white font-bold text-lg"
          >
            <Mail size={20} />
            Contact Me
          </a>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground/50">
            {["No contracts", "Free consultation", "Fast delivery"].map(
              (item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span
                    className="w-1 h-1 rounded-full"
                    style={{ background: "var(--pf-violet)" }}
                  />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────
function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "",
  );

  return (
    <footer className="border-t border-border/40 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-xl gradient-text">
              PixelForge
            </span>
            <span className="text-muted-foreground/40 text-sm">
              © {year} All rights reserved.
            </span>
          </div>

          {/* Nav */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground/60">
            {["About", "Services", "Portfolio", "Contact"].map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .querySelector(`#${link.toLowerCase()}`)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="hover:text-foreground transition-colors duration-200"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Caffeine attribution */}
          <p className="text-xs text-muted-foreground/40">
            Built with <span className="text-red-400/70">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground/70 transition-colors duration-200 underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── App Root ──────────────────────────────────────────────────────────
export default function App() {
  const [showPromo, setShowPromo] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showPromo && <PromoVideo onClose={() => setShowPromo(false)} />}
      <Navbar />
      <main>
        <HeroSection onWatchPromo={() => setShowPromo(true)} />
        <div className="px-8">
          <div className="gradient-divider" />
        </div>
        <AboutSection />
        <div className="px-8">
          <div className="gradient-divider" />
        </div>
        <ServicesSection />
        <div className="px-8">
          <div className="gradient-divider" />
        </div>
        <PortfolioSection />
        <div className="px-8">
          <div className="gradient-divider" />
        </div>
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
