"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/data";
import { Button } from "@/components/ui/button";
import ProjectDetailContent from "@/components/ProjectDetailContent";
import { ArrowLeft } from "lucide-react";

/**
 * Full-screen detail view rendered by the intercepted route.
 *
 * Looks and scrolls like the standalone page, but the homepage stays mounted
 * underneath, so going back restores it instantly with its scroll and filters intact.
 */
export default function ProjectDetailOverlay({ project }: { project: Project }) {
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router]);

  // Own the scroll lock while covering the page: one scrollbar, and the page behind
  // cannot drift, so closing returns to the exact position the user left.
  useEffect(() => {
    const y = window.scrollY;
    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      requestAnimationFrame(() => window.scrollTo(0, y));
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-black pointer-events-auto">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="font-mono text-xs gap-2 mb-10 -ml-2 text-muted-foreground hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to projects
        </Button>

        <ProjectDetailContent project={project} />
      </div>
    </div>
  );
}
