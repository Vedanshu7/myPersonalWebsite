"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useTheme } from "next-themes";
import {
  User,
  FolderGit2,
  GitPullRequest,
  Wrench,
  Award,
  Briefcase,
  PenLine,
  Mail,
  Github,
  Linkedin,
  BookOpen,
  Copy,
  SunMoon,
  CornerDownLeft,
} from "lucide-react";

const OPEN_EVENT = "open-command-palette";

/** Opens the palette from anywhere (e.g. the NavBar hint button). */
export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

interface Command {
  id: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  keywords: string;
  run: () => void;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const [copied, setCopied] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const { setTheme, resolvedTheme } = useTheme();

  const scrollTo = useCallback((id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const external = useCallback((url: string) => {
    setOpen(false);
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const commands = useMemo<Command[]>(
    () => [
      { id: "about", label: "About", hint: "Go to section", icon: <User size={15} />, keywords: "about bio", run: () => scrollTo("about") },
      { id: "projects", label: "Projects", hint: "Go to section", icon: <FolderGit2 size={15} />, keywords: "projects work portfolio", run: () => scrollTo("projects") },
      { id: "open-source", label: "Open Source", hint: "Go to section", icon: <GitPullRequest size={15} />, keywords: "open source contributions prs", run: () => scrollTo("open-source") },
      { id: "skills", label: "Skills", hint: "Go to section", icon: <Wrench size={15} />, keywords: "skills tech stack technologies", run: () => scrollTo("skills") },
      { id: "certifications", label: "Certifications", hint: "Go to section", icon: <Award size={15} />, keywords: "certifications credentials coursera", run: () => scrollTo("certifications") },
      { id: "experience", label: "Experience", hint: "Go to section", icon: <Briefcase size={15} />, keywords: "experience work history education", run: () => scrollTo("experience") },
      { id: "writing", label: "Writing", hint: "Go to section", icon: <PenLine size={15} />, keywords: "writing blog posts articles", run: () => scrollTo("writing") },
      { id: "contact", label: "Contact", hint: "Go to section", icon: <Mail size={15} />, keywords: "contact email reach", run: () => scrollTo("contact") },
      { id: "github", label: "GitHub", hint: "Open profile", icon: <Github size={15} />, keywords: "github code repos", run: () => external("https://github.com/vedanshu7") },
      { id: "linkedin", label: "LinkedIn", hint: "Open profile", icon: <Linkedin size={15} />, keywords: "linkedin connect", run: () => external("https://www.linkedin.com/in/vedanshu-joshi") },
      { id: "medium", label: "Medium", hint: "Open blog", icon: <BookOpen size={15} />, keywords: "medium blog articles", run: () => external("https://medium.com/@vedanshu7.joshi") },
      {
        id: "copy-email",
        label: copied ? "Copied!" : "Copy email address",
        hint: "vedanshu7.joshi@gmail.com",
        icon: <Copy size={15} />,
        keywords: "copy email mail address",
        run: () => {
          navigator.clipboard.writeText("vedanshu7.joshi@gmail.com").then(() => {
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
              setOpen(false);
            }, 900);
          });
        },
      },
      {
        id: "theme",
        label: "Toggle theme",
        hint: resolvedTheme === "dark" ? "Switch to light" : "Switch to dark",
        icon: <SunMoon size={15} />,
        keywords: "theme dark light mode toggle",
        run: () => {
          setTheme(resolvedTheme === "dark" ? "light" : "dark");
          setOpen(false);
        },
      },
    ],
    [scrollTo, external, copied, resolvedTheme, setTheme],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.keywords.includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    setSelected(0);
  }, [query, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
      }
    };
    const onOpenEvent = () => {
      setOpen(true);
      setQuery("");
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_EVENT, onOpenEvent);
    };
  }, []);

  const handleListKeys = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      results[selected]?.run();
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${selected}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selected]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-[20%] z-50 w-[90vw] max-w-lg -translate-x-1/2 rounded-xl border border-border bg-popover shadow-2xl overflow-hidden"
          onKeyDown={handleListKeys}
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <div className="flex items-center gap-2 border-b border-border px-4">
            <span className="font-mono text-xs text-muted-foreground">&gt;</span>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search…"
              className="w-full bg-transparent py-3.5 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <kbd className="font-mono text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
              esc
            </kbd>
          </div>

          <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
            {results.length === 0 && (
              <p className="px-3 py-6 text-center font-mono text-xs text-muted-foreground">
                No matches.
              </p>
            )}
            {results.map((cmd, i) => (
              <button
                key={cmd.id}
                data-idx={i}
                onClick={cmd.run}
                onMouseEnter={() => setSelected(i)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  i === selected ? "bg-accent text-foreground" : "text-muted-foreground"
                }`}
              >
                <span className="shrink-0">{cmd.icon}</span>
                <span className="flex-1 text-sm">{cmd.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[40%]">
                  {cmd.hint}
                </span>
                {i === selected && (
                  <CornerDownLeft size={12} className="shrink-0 text-muted-foreground" />
                )}
              </button>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
