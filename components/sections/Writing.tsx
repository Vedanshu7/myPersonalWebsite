import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { fetchMediumPosts } from "@/lib/medium";

function formatDate(raw: string): string {
  try {
    return new Date(raw).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return raw;
  }
}

export default async function Writing() {
  const posts = await fetchMediumPosts();
  if (posts.length === 0) return null;

  return (
    <section id="writing" className="py-32 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollReveal>
          <SectionHeader label="Writing" heading="Blog" headingClassName="mb-16" />
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden">
          {posts.map((post, i) => (
            <ScrollReveal key={post.link} delay={i * 0.08}>
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-card hover:bg-accent transition-colors duration-200 p-6 flex flex-col gap-3 h-full"
              >
                <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                  {formatDate(post.pubDate)}
                </p>
                <h3 className="font-semibold text-foreground text-sm leading-snug group-hover:text-foreground transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed flex-1 line-clamp-3">
                  {post.excerpt}
                </p>
                <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors mt-auto">
                  Read on Medium ↗
                </span>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
