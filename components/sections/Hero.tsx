"use client";

import { motion } from "framer-motion";
import { usePinnedScroll } from "@/hooks/usePinnedScroll";
import { Button } from "@/components/ui/button";
import { Linkedin, ArrowDown } from "lucide-react";

function GithubIcon({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
import ContributionGrid from "@/components/ContributionGrid";
import type { ContributionWeek } from "@/app/api/contributions/route";

interface HeroProps {
  contributionWeeks: ContributionWeek[];
}

export default function Hero({ contributionWeeks }: HeroProps) {
  const {
    ref,
    phase1Opacity,
    phase1Y,
    phase2Opacity,
    phase2Y,
    phase3Opacity,
    phase3Y,
    glowOpacity,
  } = usePinnedScroll();

  return (
    <section ref={ref} className="relative bg-background" style={{ height: "150vh" }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* GitHub contribution grid background */}
        <ContributionGrid weeks={contributionWeeks} />

        {/* Radial glow overlay (above grid, below text) */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,0,0,0.75) 0%, transparent 100%)",
            opacity: glowOpacity,
          }}
        />

        {/* Phase 1: Name + Title */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center pointer-events-none"
          style={{ opacity: phase1Opacity, y: phase1Y }}
        >
          <p className="font-mono text-sm tracking-[0.3em] text-muted-foreground mb-6 uppercase">
            Software Engineer
          </p>
          <h1 className="text-7xl sm:text-8xl md:text-9xl font-bold tracking-tight text-foreground leading-none">
            Vedanshu
            <br />
            <span className="text-muted-foreground">Joshi</span>
          </h1>
        </motion.div>

        {/* Phase 2: Tagline */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center pointer-events-none"
          style={{ opacity: phase2Opacity, y: phase2Y }}
        >
          <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-8 uppercase">
            What I do
          </p>
          <p className="max-w-2xl text-2xl sm:text-3xl md:text-4xl font-light text-foreground leading-snug">
            Building products at the intersection of{" "}
            <span className="text-foreground font-medium">backend systems</span> and{" "}
            <span className="text-foreground font-medium">great user experience</span>.
          </p>
        </motion.div>

        {/* Phase 3: CTAs */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 gap-8 pointer-events-none"
          style={{ opacity: phase3Opacity, y: phase3Y }}
        >
          <div className="text-center">
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground mb-4 uppercase">
              MS Computer Science · Purdue University
            </p>
            <p className="text-muted-foreground text-lg max-w-md text-center">
              Full-stack engineer with experience across .NET, React, Node.js, cloud infrastructure,
              and ML systems.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 justify-center pointer-events-auto">
            <Button
              size="lg"
              className="rounded-full px-8 font-mono text-sm tracking-wide"
              onClick={() =>
                document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View Projects
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 font-mono text-sm tracking-wide"
              onClick={() =>
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Get in Touch
            </Button>
          </div>

          <div className="flex gap-4 pointer-events-auto">
            <a
              href="https://github.com/vedanshu7"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full border border-border hover:bg-accent transition-colors"
            >
              <GithubIcon
                size={18}
                className="text-muted-foreground hover:text-foreground transition-colors"
              />
            </a>
            <a
              href="https://www.linkedin.com/in/vedanshu-joshi"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full border border-border hover:bg-accent transition-colors"
            >
              <Linkedin
                size={18}
                className="text-muted-foreground hover:text-foreground transition-colors"
              />
            </a>
          </div>
        </motion.div>

        {/* GitHub contributions hint */}
        <a
          href="https://github.com/vedanshu7"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-8 right-8 flex items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity"
        >
          <GithubIcon size={11} className="text-green-500" />
          <span className="font-mono text-[10px] text-green-500 tracking-wide">
            github activity
          </span>
        </a>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase">
            Scroll
          </span>
          <ArrowDown size={14} className="text-muted-foreground animate-bounce-down" />
        </motion.div>
      </div>
    </section>
  );
}
