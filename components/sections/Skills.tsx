"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Technology } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";

interface SkillsProps {
  techStack: Technology[];
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, scale: 0.85 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function Skills({ techStack }: SkillsProps) {
  return (
    <section id="skills" className="py-32 border-t border-border bg-secondary">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal>
          <SectionHeader label="Stack" heading="Technologies" headingClassName="mb-16" />
        </ScrollReveal>

        <motion.div
          className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-px bg-border rounded-xl overflow-hidden"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {techStack.map((tech) => (
            <motion.div
              key={tech.name}
              variants={item}
              className="bg-card hover:bg-accent transition-colors duration-200 p-4 flex flex-col items-center justify-center gap-2 group cursor-default"
            >
              <div className="relative w-8 h-8">
                <Image
                  src={tech.icon}
                  alt={tech.name}
                  fill
                  className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  sizes="32px"
                  unoptimized={tech.icon.startsWith("http")}
                />
              </div>
              <span className="font-mono text-[9px] text-muted-foreground text-center leading-tight tracking-wide group-hover:text-foreground transition-colors">
                {tech.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
