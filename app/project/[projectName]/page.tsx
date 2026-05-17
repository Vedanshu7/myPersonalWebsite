import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";

export async function generateStaticParams() {
  return projects.map((p) => ({ projectName: p.projectURL }));
}

export async function generateMetadata({ params }: { params: Promise<{ projectName: string }> }) {
  const { projectName } = await params;
  const project = projects.find((p) => p.projectURL === projectName);
  if (!project) return { title: "Project Not Found" };

  const url = `https://vedanshujoshi.com/project/${projectName}`;
  return {
    title: project.title,
    description: project.descriptionShort,
    alternates: { canonical: url },
    openGraph: {
      title: `${project.title} — Vedanshu Joshi`,
      description: project.descriptionShort,
      url,
      type: "article",
      images: [
        {
          url: project.projectImg,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — Vedanshu Joshi`,
      description: project.descriptionShort,
      images: [project.projectImg],
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectName: string }>;
}) {
  const { projectName } = await params;
  const project = projects.find((p) => p.projectURL === projectName);
  if (!project) notFound();

  return (
    <main className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/#projects">
          <Button
            variant="ghost"
            className="font-mono text-xs gap-2 mb-10 -ml-2 text-muted-foreground hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to projects
          </Button>
        </Link>

        <div className="mb-2 flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[10px]">
            {project.type}
          </Badge>
        </div>

        <h1 className="text-4xl font-bold text-white mb-6">{project.title}</h1>

        <div className="relative aspect-video rounded-xl overflow-hidden bg-secondary mb-10">
          <Image
            src={project.projectImg}
            alt={project.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        <p className="text-muted-foreground leading-relaxed mb-10 text-base">
          {project.descriptionLong}
        </p>

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
                    className="object-contain"
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
    </main>
  );
}
