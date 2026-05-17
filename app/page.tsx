import { Suspense } from "react";

import NavBar from "@/components/NavBar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Certifications from "@/components/sections/Certifications";
import OpenSource from "@/components/sections/OpenSource";
import Writing from "@/components/sections/Writing";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";
import PageWrapper from "@/components/PageWrapper";
import SectionSkeleton from "@/components/SectionSkeleton";
import { getEditableContent } from "@/lib/content";
import { getKVProjects, mergeProjects } from "@/lib/projects";
import { getBaseUrl } from "@/lib/utils";
import type { ContributionWeek } from "@/app/api/contributions/route";
import type { GithubStats } from "@/app/api/github-stats/route";
import type { OpenSourceItem } from "@/app/api/open-source/route";

async function fetchContributions(): Promise<ContributionWeek[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/contributions`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.weeks ?? [];
  } catch {
    return [];
  }
}

async function fetchOpenSource(): Promise<OpenSourceItem[]> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/open-source`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items ?? [];
  } catch {
    return [];
  }
}

async function fetchGithubStats(): Promise<GithubStats> {
  try {
    const res = await fetch(`${getBaseUrl()}/api/github-stats`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return { publicRepos: 0, followers: 0, totalStars: 0 };
  }
}

async function HeroSection() {
  const weeks = await fetchContributions();
  return <Hero contributionWeeks={weeks} />;
}

async function AboutSection() {
  const [content, githubStats] = await Promise.all([getEditableContent(), fetchGithubStats()]);
  return <About content={content} githubStats={githubStats} />;
}

async function OpenSourceSection() {
  const items = await fetchOpenSource();
  return <OpenSource items={items} />;
}

async function MainContent() {
  const [content, kvProjects] = await Promise.all([getEditableContent(), getKVProjects()]);
  const projects = mergeProjects(kvProjects);

  return (
    <>
      <Suspense fallback={<SectionSkeleton height="h-screen" />}>
        <HeroSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton height="h-64" />}>
        <AboutSection />
      </Suspense>
      <Projects projects={projects} />
      <Suspense fallback={<SectionSkeleton height="h-96" />}>
        <OpenSourceSection />
      </Suspense>
      <Skills techStack={content.techStack} />
      <Certifications />
      <Experience workEvents={content.workEvents} educationEvents={content.educationEvents} />
      <Suspense fallback={null}>
        <Writing />
      </Suspense>
      <Contact contactEmail={content.contactEmail} />
    </>
  );
}

export default async function Home() {
  return (
    <PageWrapper>
      <NavBar />
      <Suspense fallback={null}>
        <MainContent />
      </Suspense>
      <Footer />
    </PageWrapper>
  );
}
