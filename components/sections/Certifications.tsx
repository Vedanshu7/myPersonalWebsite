"use client";

import { motion } from "framer-motion";
import { certifications } from "@/lib/data";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { ArrowUpRight } from "lucide-react";

export default function Certifications() {
  return (
    <section id="certifications" className="py-32 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal>
          <SectionHeader label="Credentials" heading="Certifications" headingClassName="mb-16" />
        </ScrollReveal>

        <div className="flex flex-col sm:flex-row gap-4">
          {certifications.map((cert, i) => (
            <motion.a
              key={cert.credentialUrl}
              href={cert.credentialUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const }}
              className="group flex items-start justify-between gap-4 border border-border rounded-lg px-5 py-4 hover:bg-card/50 hover:border-foreground/20 transition-all duration-200 flex-1"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-snug">{cert.title}</p>
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mt-2">
                  {cert.issuer} · {cert.issued}
                </p>
              </div>
              <ArrowUpRight
                size={14}
                className="text-muted-foreground group-hover:text-foreground transition-colors mt-0.5 flex-shrink-0"
              />
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
