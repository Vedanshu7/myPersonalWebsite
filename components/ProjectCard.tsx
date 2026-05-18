"use client";

import Image from "next/image";
import { useState } from "react";
import type { Project } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, ArrowUpRight } from "lucide-react";

function GithubIcon({ size = 13, className }: { size?: number; className?: string }) {
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

interface ProjectCardProps {
  project: Project;
  index: number;
}

const FALLBACK_IMG = "/project-image/fallback.svg";

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const [open, setOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState(project.projectImg);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group text-left w-full border border-border rounded-xl overflow-hidden bg-card hover:border-foreground/20 transition-all duration-300 hover:-translate-y-1"
      >
        <div className="relative aspect-video overflow-hidden bg-secondary">
          <Image
            src={imgSrc}
            onError={() => setImgSrc(FALLBACK_IMG)}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-foreground text-background rounded-full p-1.5">
              <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground text-base leading-tight">
              {project.title}
            </h3>
            <span className="font-mono text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5 whitespace-nowrap shrink-0">
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
          <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wide mb-3">
            {project.type}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {project.descriptionShort}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {project.technologyUsed.slice(0, 4).map((tech) => (
              <Badge key={tech.name} variant="outline" className="text-[10px] font-mono">
                {tech.name}
              </Badge>
            ))}
            {project.technologyUsed.length > 4 && (
              <Badge variant="outline" className="text-[10px] font-mono">
                +{project.technologyUsed.length - 4}
              </Badge>
            )}
          </div>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0 max-h-[90vh] flex flex-col">
          {/* Hero image with title overlay */}
          <div className="relative w-full shrink-0" style={{ aspectRatio: "16/7" }}>
            <Image
              src={imgSrc}
            onError={() => setImgSrc(FALLBACK_IMG)}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 672px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className="font-mono text-[10px] text-white/60 uppercase tracking-[0.2em]">
                {project.type}
              </span>
              <DialogTitle className="text-xl font-bold text-white mt-1 leading-tight">
                {project.title}
              </DialogTitle>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex flex-col gap-5 p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.descriptionLong}
            </p>

            <div>
              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-3">
                Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {project.technologyUsed.map((tech) => (
                  <div
                    key={tech.name}
                    className="flex items-center gap-1.5 border border-border rounded-md px-2.5 py-1.5 bg-secondary/50"
                  >
                    {tech.img && (
                      <Image
                        src={tech.img}
                        alt={tech.name}
                        width={14}
                        height={14}
                        className="object-contain"
                      />
                    )}
                    <span className="font-mono text-[11px] text-foreground/70">
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              {project.button.viewCodeUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full font-mono text-xs gap-1.5"
                  asChild
                >
                  <a href={project.button.viewCodeUrl} target="_blank" rel="noopener noreferrer">
                    <GithubIcon size={13} />
                    View Code
                  </a>
                </Button>
              )}
              {project.button.viewProjectUrl && (
                <Button size="sm" className="rounded-full font-mono text-xs gap-1.5" asChild>
                  <a
                    href={project.button.viewProjectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink size={13} />
                    Live Demo
                  </a>
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
