"use client";

import { motion } from "framer-motion";
import type { Project } from "@/lib/data";
import ProjectCard from "@/components/ProjectCard";
import ScrollReveal from "@/components/ScrollReveal";

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  return (
    <section id="projects" className="py-32 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase mb-3">
                Work
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
                Projects
              </h2>
            </div>
            <span className="font-mono text-sm text-muted-foreground hidden sm:block">
              {projects.length} projects
            </span>
          </div>
        </ScrollReveal>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {projects.map((project, index) => (
            <motion.div key={project.projectURL} variants={item}>
              <ProjectCard project={project} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
