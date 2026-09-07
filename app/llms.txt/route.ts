import { getMergedProjects } from "@/lib/projects";
import { getEditableContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const revalidate = 86400;

/**
 * Serves /llms.txt, the llmstxt.org convention for describing a site to LLM crawlers.
 *
 * @remarks
 * Generated from the same sources as the site itself, so newly synced projects appear
 * here without a separate edit.
 */
export async function GET() {
  const [projects, content] = await Promise.all([getMergedProjects(), getEditableContent()]);

  const projectLines = projects
    .map((p) => `- [${p.title}](${SITE_URL}/project/${p.projectURL}): ${p.descriptionShort}`)
    .join("\n");

  const body = `# Vedanshu Joshi

> Software Engineer with an MS in Computer Science from Purdue University, building full-stack products, agentic AI systems, data pipelines, and cloud-native services.

${content.bio}

## Projects

${projectLines}

## Pages

- [Home](${SITE_URL}): about, projects, skills, experience, certifications, and contact
- [Sitemap](${SITE_URL}/sitemap.xml): every indexable URL

## Contact

- Email: ${content.contactEmail}
- GitHub: https://github.com/vedanshu7
- LinkedIn: https://www.linkedin.com/in/vedanshu-joshi
- Medium: https://medium.com/@vedanshu7.joshi
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
    },
  });
}
