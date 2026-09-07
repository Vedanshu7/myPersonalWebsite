import Image from "next/image";
import type { Project } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ProjectHeroImage from "@/components/ProjectHeroImage";
import { ExternalLink, Github } from "lucide-react";

export default function ProjectDetailContent({ project }: { project: Project }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <Badge variant="outline" className="font-mono text-[10px]">
          {project.type}
        </Badge>
      </div>

      <h1 className="text-4xl font-bold text-white mb-6">{project.title}</h1>

      <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary mb-10">
        <ProjectHeroImage src={project.projectImg} alt={project.title} />
      </div>

      <p className="text-muted-foreground leading-relaxed mb-10 text-base">
        {project.descriptionLong}
      </p>

      {project.features && project.features.length > 0 && (
        <div className="mb-10">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
            Key Features
          </p>
          <ul className="space-y-2">
            {project.features.map((feature) => (
              <li key={feature} className="flex gap-2 text-muted-foreground text-base leading-relaxed">
                <span className="text-white/40">-</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {project.gallery && project.gallery.length > 0 && (
        <div className="mb-10">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
            Gallery
          </p>
          <div className="grid grid-cols-2 gap-3">
            {project.gallery.map((src) => (
              <div key={src} className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
                <Image
                  src={src}
                  alt={project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 384px"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-10">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-4">
          Technologies Used
        </p>
        <div className="flex flex-wrap gap-2">
          {project.technologyUsed.map((tech) => (
            <div
              key={tech.name}
              className="flex items-center gap-2 border border-border rounded-md px-3 py-1.5"
            >
              {tech.img && (
                <Image
                  src={tech.img}
                  alt={tech.name}
                  width={16}
                  height={16}
                  className="object-contain shrink-0 h-4 w-4"
                />
              )}
              <span className="font-mono text-xs text-muted-foreground">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {project.button.viewCodeUrl && (
          <Button variant="outline" className="rounded-full font-mono text-xs gap-2" asChild>
            <a href={project.button.viewCodeUrl} target="_blank" rel="noopener noreferrer">
              <Github size={14} />
              View Code
            </a>
          </Button>
        )}
        {project.button.viewProjectUrl && (
          <Button className="rounded-full font-mono text-xs gap-2" asChild>
            <a href={project.button.viewProjectUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} />
              Live Demo
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
