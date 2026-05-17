"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { EditableContent } from "@/lib/content";
import type { TimelineEvent, Technology } from "@/lib/data";
import { Plus, Trash2, Check, AlertCircle } from "lucide-react";

interface Props {
  content: EditableContent;
  saveAction: (formData: FormData) => Promise<{ success?: boolean; error?: string }>;
}

export default function AdminForm({ content, saveAction }: Props) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [workEvents, setWorkEvents] = useState<TimelineEvent[]>(content.workEvents);
  const [educationEvents, setEducationEvents] = useState<TimelineEvent[]>(content.educationEvents);
  const [techStack, setTechStack] = useState<Technology[]>(content.techStack);

  // ── Work helpers ────────────────────────────────────────────────────────────
  function addWorkEvent() {
    setWorkEvents((p) => [...p, { title: "", organization: "", period: "", type: "work" }]);
  }
  function removeWorkEvent(i: number) {
    setWorkEvents((p) => p.filter((_, idx) => idx !== i));
  }
  function updateWorkEvent(i: number, field: keyof TimelineEvent, value: string) {
    setWorkEvents((p) => p.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)));
  }

  // ── Education helpers ────────────────────────────────────────────────────────
  function addEducationEvent() {
    setEducationEvents((p) => [
      ...p,
      { title: "", organization: "", period: "", type: "education" },
    ]);
  }
  function removeEducationEvent(i: number) {
    setEducationEvents((p) => p.filter((_, idx) => idx !== i));
  }
  function updateEducationEvent(i: number, field: keyof TimelineEvent, value: string) {
    setEducationEvents((p) => p.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)));
  }

  // ── Tech stack helpers ───────────────────────────────────────────────────────
  function addTech() {
    setTechStack((p) => [...p, { name: "", icon: "" }]);
  }
  function removeTech(i: number) {
    setTechStack((p) => p.filter((_, idx) => idx !== i));
  }
  function updateTech(i: number, field: keyof Technology, value: string) {
    setTechStack((p) => p.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("workEvents", JSON.stringify(workEvents));
    formData.set("educationEvents", JSON.stringify(educationEvents));
    formData.set("techStack", JSON.stringify(techStack));

    startTransition(async () => {
      const res = await saveAction(formData);
      setResult(res);
      setTimeout(() => setResult(null), 4000);
    });
  }

  const eventCard = (
    label: { role: string; org: string },
    event: TimelineEvent,
    i: number,
    onRemove: () => void,
    onUpdate: (field: keyof TimelineEvent, value: string) => void,
  ) => (
    <div key={i} className="border border-border rounded-lg p-4 space-y-3 relative">
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-3 right-3 text-muted-foreground hover:text-white transition-colors"
      >
        <Trash2 size={14} />
      </button>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
            {label.role}
          </Label>
          <Input
            value={event.title}
            onChange={(e) => onUpdate("title", e.target.value)}
            placeholder={label.role}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
            {label.org}
          </Label>
          <Input
            value={event.organization}
            onChange={(e) => onUpdate("organization", e.target.value)}
            placeholder={label.org}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
          Period
        </Label>
        <Input
          value={event.period}
          onChange={(e) => onUpdate("period", e.target.value)}
          placeholder="Jan 2024 – Present"
        />
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* About */}
      <section className="space-y-4">
        <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-widest border-b border-border pb-3">
          About
        </h2>
        <div className="space-y-1.5">
          <Label
            htmlFor="bio"
            className="font-mono text-xs text-muted-foreground uppercase tracking-wide"
          >
            Bio
          </Label>
          <Textarea id="bio" name="bio" defaultValue={content.bio} rows={4} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {(
            [
              { name: "yearsExperience", label: "Years Exp." },
              { name: "projectCount", label: "Projects" },
              { name: "techCount", label: "Technologies" },
            ] as const
          ).map(({ name, label }) => (
            <div key={name} className="space-y-1.5">
              <Label
                htmlFor={name}
                className="font-mono text-xs text-muted-foreground uppercase tracking-wide"
              >
                {label}
              </Label>
              <Input id={name} name={name} defaultValue={content[name]} placeholder="e.g. 6+" />
            </div>
          ))}
        </div>
      </section>

      {/* Contact Email */}
      <section className="space-y-4">
        <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-widest border-b border-border pb-3">
          Contact
        </h2>
        <div className="space-y-1.5">
          <Label
            htmlFor="contactEmail"
            className="font-mono text-xs text-muted-foreground uppercase tracking-wide"
          >
            Email
          </Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={content.contactEmail}
            placeholder="you@example.com"
          />
        </div>
      </section>

      {/* Work Experience */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Work Experience
          </h2>
          <button
            type="button"
            onClick={addWorkEvent}
            className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-white transition-colors"
          >
            <Plus size={12} /> Add entry
          </button>
        </div>
        <div className="space-y-4">
          {workEvents.map((event, i) =>
            eventCard(
              { role: "Role", org: "Company" },
              event,
              i,
              () => removeWorkEvent(i),
              (field, value) => updateWorkEvent(i, field, value),
            ),
          )}
        </div>
      </section>

      {/* Education */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Education
          </h2>
          <button
            type="button"
            onClick={addEducationEvent}
            className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-white transition-colors"
          >
            <Plus size={12} /> Add entry
          </button>
        </div>
        <div className="space-y-4">
          {educationEvents.map((event, i) =>
            eventCard(
              { role: "Degree", org: "School" },
              event,
              i,
              () => removeEducationEvent(i),
              (field, value) => updateEducationEvent(i, field, value),
            ),
          )}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Tech Stack
          </h2>
          <button
            type="button"
            onClick={addTech}
            className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-white transition-colors"
          >
            <Plus size={12} /> Add tech
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {techStack.map((tech, i) => (
            <div key={i} className="border border-border rounded-lg p-3 space-y-2 relative">
              <button
                type="button"
                onClick={() => removeTech(i)}
                className="absolute top-2.5 right-2.5 text-muted-foreground hover:text-white transition-colors"
              >
                <Trash2 size={13} />
              </button>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
                  Name
                </Label>
                <Input
                  value={tech.name}
                  onChange={(e) => updateTech(i, "name", e.target.value)}
                  placeholder="React"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="font-mono text-xs text-muted-foreground uppercase tracking-wide">
                  Icon URL / Path
                </Label>
                <Input
                  value={tech.icon}
                  onChange={(e) => updateTech(i, "icon", e.target.value)}
                  placeholder="/technology-icon/react.svg"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isPending} className="rounded-full font-mono text-sm px-8">
          {isPending ? "Saving..." : "Save & Publish"}
        </Button>
        {result?.success && (
          <span className="flex items-center gap-1.5 font-mono text-xs text-green-400">
            <Check size={13} /> Published — homepage updated
          </span>
        )}
        {result?.error && (
          <span className="flex items-center gap-1.5 font-mono text-xs text-red-400">
            <AlertCircle size={13} /> {result.error}
          </span>
        )}
      </div>
    </form>
  );
}
