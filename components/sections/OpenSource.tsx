"use client";

import { motion } from "framer-motion";
import { GitPullRequest, CircleDot, GitMerge, ExternalLink } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import type { OpenSourceItem } from "@/app/api/open-source/route";

function StateBadge({
  state,
  type,
}: {
  state: OpenSourceItem["state"];
  type: OpenSourceItem["type"];
}) {
  if (type === "pr") {
    if (state === "merged")
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <GitMerge size={9} /> Merged
        </span>
      );
    if (state === "open")
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
          <GitPullRequest size={9} /> Open
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
        <GitPullRequest size={9} /> Closed
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${
        state === "open"
          ? "bg-green-500/10 text-green-400 border-green-500/20"
          : "bg-muted/30 text-muted-foreground border-border"
      }`}
    >
      <CircleDot size={9} /> {state === "open" ? "Open" : "Closed"}
    </span>
  );
}

function ContributionRow({ item, index }: { item: OpenSourceItem; index: number }) {
  const date = new Date(item.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 10) * 0.05, ease: [0.25, 0.46, 0.45, 0.94] as const }}
      className="group grid grid-cols-[1fr_auto] gap-4 py-3.5 border-b border-border last:border-b-0 hover:bg-card/50 transition-colors duration-200 -mx-3 px-3 rounded-sm"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <StateBadge state={item.state} type={item.type} />
          <span
            role="link"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(item.repoUrl, "_blank", "noopener,noreferrer");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") window.open(item.repoUrl, "_blank", "noopener,noreferrer");
            }}
            className="font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors truncate cursor-pointer"
          >
            {item.repo}
          </span>
        </div>
        <p className="text-sm text-foreground leading-snug group-hover:text-foreground line-clamp-1">
          {item.title}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="font-mono text-[10px] text-muted-foreground tabular-nums hidden sm:block">
          {date}
        </span>
        <ExternalLink
          size={12}
          className="text-muted-foreground group-hover:text-foreground transition-colors"
        />
      </div>
    </motion.a>
  );
}

interface OpenSourceProps {
  items: OpenSourceItem[];
}

export default function OpenSource({ items }: OpenSourceProps) {
  if (items.length === 0) return null;

  const prs = items.filter((i) => i.type === "pr");
  const issues = items.filter((i) => i.type === "issue");

  return (
    <section id="open-source" className="py-32 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal>
          <SectionHeader label="Community" heading="Open Source" headingClassName="mb-16" />
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
          {/* PRs */}
          {prs.length > 0 && (
            <div>
              <ScrollReveal>
                <div className="flex items-center gap-3 mb-4">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] whitespace-nowrap">
                    Pull Requests
                  </p>
                  <div className="h-px flex-1 bg-border" />
                  <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                    {prs.length}
                  </span>
                </div>
              </ScrollReveal>
              {prs.map((item, i) => (
                <ContributionRow key={item.id} item={item} index={i} />
              ))}
            </div>
          )}

          {/* Issues */}
          {issues.length > 0 && (
            <div>
              <ScrollReveal>
                <div className="flex items-center gap-3 mb-4">
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.25em] whitespace-nowrap">
                    Issues
                  </p>
                  <div className="h-px flex-1 bg-border" />
                  <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                    {issues.length}
                  </span>
                </div>
              </ScrollReveal>
              {issues.map((item, i) => (
                <ContributionRow key={item.id} item={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
