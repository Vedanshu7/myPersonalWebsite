"use client";

import { useRef, useState, useEffect } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import type { EditableContent } from "@/lib/content";
import type { GithubStats } from "@/app/api/github-stats/route";

interface AboutProps {
  content: EditableContent;
  githubStats: GithubStats;
}

function parseValue(val: string): { num: number; suffix: string } {
  const match = /^(\d+)(.*)$/.exec(val.trim());
  return match ? { num: parseInt(match[1]), suffix: match[2] } : { num: 0, suffix: val };
}

function useCountUp(target: number, duration = 1200, active: boolean) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const raf = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(eased * target));
      if (t < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [active, target, duration]);

  return display;
}

function AnimatedStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const { num, suffix } = parseValue(value);
  const count = useCountUp(num, 1200, active);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-card p-6 text-center">
      <p className="font-mono text-4xl font-bold text-foreground mb-2">
        {count}
        {suffix}
      </p>
      <p className="font-mono text-[11px] text-muted-foreground tracking-wide uppercase leading-tight">
        {label}
      </p>
    </div>
  );
}

export default function About({ content, githubStats }: AboutProps) {
  const stats = [
    { value: content.yearsExperience, label: "Years of Experience" },
    {
      value: githubStats.publicRepos > 0 ? `${githubStats.publicRepos}+` : content.projectCount,
      label: "Public Repositories",
    },
    { value: content.techCount, label: "Technologies" },
  ];

  return (
    <section id="about" className="py-32 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <ScrollReveal>
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase mb-4">
              About
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight">
              Building robust systems, end to end.
            </h2>
            <p className="text-muted-foreground leading-relaxed">{content.bio}</p>
          </ScrollReveal>

          <div className="grid grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
            {stats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 0.1}>
                <AnimatedStat value={stat.value} label={stat.label} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
