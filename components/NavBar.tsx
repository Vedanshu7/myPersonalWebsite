"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Open Source", href: "#open-source" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "Writing", href: "#writing" },
  { label: "Contact", href: "#contact" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.href.slice(1));
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      let current = "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - 80 <= 0) current = id;
      }
      // When the page is scrolled to the bottom, force the last section active
      // regardless of its height relative to the viewport.
      if (y + window.innerHeight >= document.documentElement.scrollHeight - 50) {
        current = sectionIds[sectionIds.length - 1];
      }
      setActiveSection(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-md border-b border-border" : "bg-transparent",
      )}
    >
      <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center">
        {/* Left — logo */}
        <div className="flex-1">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="font-mono text-sm font-bold text-foreground tracking-widest hover:text-muted-foreground transition-colors"
          >
            Home
          </button>
        </div>

        {/* Center — desktop nav links */}
        <div className="hidden sm:flex items-center gap-5">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={cn(
                  "font-mono text-xs tracking-wide uppercase transition-colors relative",
                  isActive
                    ? "text-foreground after:absolute after:-bottom-0.5 after:left-0 after:right-0 after:h-px after:bg-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        {/* Right — theme toggle (desktop) + hamburger (mobile) */}
        <div className="flex-1 flex items-center justify-end">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-px h-3.5 bg-border" />
            <ThemeToggle />
          </div>
          <div className="sm:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="flex flex-col gap-1.5 p-1"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span
                className={cn(
                  "w-5 h-px bg-foreground transition-all duration-200",
                  menuOpen && "translate-y-2 rotate-45",
                )}
              />
              <span
                className={cn(
                  "w-5 h-px bg-foreground transition-all duration-200",
                  menuOpen && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "w-5 h-px bg-foreground transition-all duration-200",
                  menuOpen && "-translate-y-2 -rotate-45",
                )}
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden bg-background/95 border-b border-border px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase text-left"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
