"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ScrollReveal from "@/components/ScrollReveal";
import { CheckCircle, Send, Copy, Check } from "lucide-react";

export default function Contact({ contactEmail }: { contactEmail: string }) {
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  function copyEmail() {
    navigator.clipboard.writeText(contactEmail).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_FORMSPREE_URL!, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      if (res.ok) {
        setSucceeded(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (succeeded) {
    return (
      <section id="contact" className="py-32 border-t border-border bg-secondary">
        <div className="max-w-lg mx-auto px-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-full border border-border bg-card flex items-center justify-center">
              <CheckCircle size={24} className="text-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Message sent</h3>
            <p className="text-muted-foreground font-mono text-sm">
              Thanks for reaching out. I&apos;ll get back to you soon.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-32 border-t border-border bg-secondary">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <ScrollReveal>
            <p className="font-mono text-xs tracking-[0.3em] text-muted-foreground uppercase mb-3">
              Contact
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 leading-tight">
              Let&apos;s work
              <br />
              together.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Open to full-time roles, contract work, and interesting collaborations. Drop me a
              message and I&apos;ll get back to you.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${contactEmail}`}
                  className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {contactEmail} ↗
                </a>
                <button
                  onClick={copyEmail}
                  aria-label="Copy email"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                </button>
              </div>
              <a
                href="https://github.com/vedanshu7"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors block"
              >
                github.com/vedanshu7 ↗
              </a>
              <a
                href="https://www.linkedin.com/in/vedanshu-joshi"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors block"
              >
                linkedin.com/in/vedanshu-joshi ↗
              </a>
              <a
                href="https://medium.com/@vedanshu7.joshi"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-muted-foreground hover:text-foreground transition-colors block"
              >
                medium.com/@vedanshu7.joshi ↗
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.15}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="name"
                    className="font-mono text-xs text-muted-foreground uppercase tracking-wide"
                  >
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="font-mono text-xs text-muted-foreground uppercase tracking-wide"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="subject"
                  className="font-mono text-xs text-muted-foreground uppercase tracking-wide"
                >
                  Subject
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="What's this about?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="message"
                  className="font-mono text-xs text-muted-foreground uppercase tracking-wide"
                >
                  Message
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell me about your project or opportunity..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              {error && (
                <p className="font-mono text-xs text-red-500 text-center">
                  Something went wrong. Please try again or email me directly.
                </p>
              )}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full font-mono text-sm gap-2"
              >
                <Send size={14} />
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
