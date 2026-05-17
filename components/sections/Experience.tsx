"use client";

import { motion } from "framer-motion";
import type { TimelineEvent } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";

interface RowProps {
  title: string;
  organization: string;
  period: string;
  index: number;
}

function Row({ title, organization, period, index }: RowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className="group grid grid-cols-[160px_1fr] gap-6 py-4 border-b border-border last:border-b-0 hover:bg-card/50 transition-colors duration-200 cursor-default -mx-3 px-3 rounded-sm"
    >
      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider leading-relaxed pt-0.5 tabular-nums">
        {period}
      </p>
      <div>
        <h3 className="font-semibold text-foreground text-sm leading-snug">{title}</h3>
        <p className="text-muted-foreground text-xs mt-0.5">{organization}</p>
      </div>
    </motion.div>
  );
}

interface ExperienceProps {
  workEvents: TimelineEvent[];
  educationEvents: TimelineEvent[];
}

export default function Experience({ workEvents, educationEvents }: ExperienceProps) {
  return (
    <section id="experience" className="py-32 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal>
          <SectionHeader label="Journey" heading="Experience & Education" headingClassName="mb-16" />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* Work */}
          <div>
            <ScrollReveal>
              <div className="flex items-center gap-3 mb-6">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] whitespace-nowrap">
                  Work Experience
                </p>
                <div className="h-px flex-1 bg-border" />
                <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                  {workEvents.length}
                </span>
              </div>
            </ScrollReveal>
            {workEvents.map((event, i) => (
              <Row key={`${event.organization}-${event.title}`} {...event} index={i} />
            ))}
          </div>

          {/* Education */}
          <div>
            <ScrollReveal>
              <div className="flex items-center gap-3 mb-6">
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] whitespace-nowrap">
                  Education
                </p>
                <div className="h-px flex-1 bg-border" />
                <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                  {educationEvents.length}
                </span>
              </div>
            </ScrollReveal>
            {educationEvents.map((event, i) => (
              <Row key={`${event.organization}-${event.title}`} {...event} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
