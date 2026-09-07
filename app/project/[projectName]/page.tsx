import { notFound } from "next/navigation";
import Link from "next/link";
import { getMergedProjects } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";
import { Button } from "@/components/ui/button";
import ProjectDetailContent from "@/components/ProjectDetailContent";
import { ArrowLeft } from "lucide-react";

// Projects synced from GitHub after build time aren't in generateStaticParams; render them on demand.
export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await getMergedProjects();
  return projects.map((p) => ({ projectName: p.projectURL }));
}

export async function generateMetadata({ params }: { params: Promise<{ projectName: string }> }) {
  const { projectName } = await params;
  const projects = await getMergedProjects();
  const project = projects.find((p) => p.projectURL === projectName);
  if (!project) return { title: "Project Not Found" };

  const url = `${SITE_URL}/project/${projectName}`;
  return {
    title: project.title,
    description: project.descriptionShort,
    alternates: { canonical: url },
    openGraph: {
      title: `${project.title} | Vedanshu Joshi`,
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
      title: `${project.title} | Vedanshu Joshi`,
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
  const projects = await getMergedProjects();
  const project = projects.find((p) => p.projectURL === projectName);
  if (!project) notFound();

  return (
    <main className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href={`/?openProject=${project.projectURL}#projects`}>
          <Button
            variant="ghost"
            className="font-mono text-xs gap-2 mb-10 -ml-2 text-muted-foreground hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to projects
          </Button>
        </Link>

        <ProjectDetailContent project={project} />
      </div>
    </main>
  );
}
