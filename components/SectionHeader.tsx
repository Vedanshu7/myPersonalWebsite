import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label: string;
  heading: string;
  /** Additional classes applied to the h2 element. */
  headingClassName?: string;
}

export default function SectionHeader({ label, heading, headingClassName }: SectionHeaderProps) {
  return (
    <>
      <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase mb-3">
        {label}
      </p>
      <h2
        className={cn(
          "text-4xl sm:text-5xl font-bold text-foreground leading-tight",
          headingClassName,
        )}
      >
        {heading}
      </h2>
    </>
  );
}
