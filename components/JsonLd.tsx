export default function JsonLd() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Vedanshu Joshi",
    url: "https://vedanshujoshi.com",
    image: "https://vedanshujoshi.com/opengraph-image",
    jobTitle: "Software Engineer",
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Purdue University",
    },
    sameAs: [
      "https://github.com/vedanshu7",
      "https://www.linkedin.com/in/vedanshu-joshi",
      "https://medium.com/@vedanshu7.joshi",
    ],
    knowsAbout: [
      "Full-Stack Development",
      "Agentic AI Systems",
      "Data Pipelines",
      "Distributed Systems",
      "React",
      "Next.js",
      "Node.js",
      "TypeScript",
      "Python",
      "Go",
      "Cloud Infrastructure",
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Vedanshu Joshi",
    url: "https://vedanshujoshi.com",
    description:
      "Portfolio of Vedanshu Joshi — Software Engineer, MS Computer Science Purdue University.",
    author: { "@type": "Person", name: "Vedanshu Joshi" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
