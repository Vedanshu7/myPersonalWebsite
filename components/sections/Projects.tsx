"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Project } from "@/lib/data";
import ProjectCard from "@/components/ProjectCard";
import ScrollReveal from "@/components/ScrollReveal";

const FEATURED_COUNT = 6;
const CHIP_COUNT = 8;

// Collapse spelling variants so "React Js" and "React" filter as one tech.
const TECH_ALIASES: Record<string, string> = {
  reactjs: "react",
  nodejs: "node",
  node: "node",
  net: ".net",
};

function normalizeTech(name: string): string {
  const n = name.toLowerCase().replace(/[\s.]/g, "");
  return TECH_ALIASES[n] ?? n;
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  const [activeTech, setActiveTech] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Most-used technologies become filter chips, displayed with their first-seen label.
  const chips = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const p of projects) {
      for (const t of p.technologyUsed) {
        const key = normalizeTech(t.name);
        const entry = counts.get(key);
        if (entry) entry.count++;
        else counts.set(key, { label: t.name, count: 1 });
      }
    }
    return [...counts.entries()]
      .filter(([, v]) => v.count >= 2)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, CHIP_COUNT)
      .map(([key, v]) => ({ key, label: v.label }));
  }, [projects]);

  const filtered = useMemo(() => {
    if (!activeTech) return projects;
    return projects.filter((p) => p.technologyUsed.some((t) => normalizeTech(t.name) === activeTech));
  }, [projects, activeTech]);

  const expanded = showAll || activeTech !== null;
  const visible = expanded ? filtered : filtered.slice(0, FEATURED_COUNT);
  const hiddenCount = filtered.length - visible.length;

  return (
    <section id="projects" className="py-32 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase mb-3">
                Work
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
                Projects
              </h2>
            </div>
            <span className="font-mono text-sm text-muted-foreground hidden sm:block">
              {activeTech ? `${filtered.length} of ${projects.length}` : `${projects.length} projects`}
            </span>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveTech(null)}
              className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-colors duration-200 ${
                activeTech === null
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              All
            </button>
            {chips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => setActiveTech(activeTech === chip.key ? null : chip.key)}
                className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-colors duration-200 ${
                  activeTech === chip.key
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <AnimatePresence mode="popLayout">
            {visible.map((project, index) => (
              <motion.div
                key={project.projectURL}
                layout
                variants={item}
                initial="hidden"
                whileInView="show"
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                viewport={{ once: true, margin: "-80px" }}
              >
                <ProjectCard project={project} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {hiddenCount > 0 && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setShowAll(true)}
              className="font-mono text-sm px-6 py-2.5 rounded-full border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors duration-200"
            >
              Show all {filtered.length} projects
            </button>
          </div>
        )}
        {showAll && !activeTech && filtered.length > FEATURED_COUNT && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setShowAll(false)}
              className="font-mono text-sm px-6 py-2.5 rounded-full border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors duration-200"
            >
              Show less
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
