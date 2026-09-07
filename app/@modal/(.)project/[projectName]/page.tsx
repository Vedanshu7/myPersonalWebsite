import { notFound } from "next/navigation";
import { getMergedProjects } from "@/lib/projects";
import ProjectDetailOverlay from "@/components/ProjectDetailOverlay";

export default async function InterceptedProjectPage({
  params,
}: {
  params: Promise<{ projectName: string }>;
}) {
  const { projectName } = await params;
  const projects = await getMergedProjects();
  const project = projects.find((p) => p.projectURL === projectName);
  if (!project) notFound();

  return <ProjectDetailOverlay project={project} />;
}
